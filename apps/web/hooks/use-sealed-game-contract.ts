"use client";

import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import * as sealedGame from "@/contracts/generated/relic-of-lies-v3/deps/contract_v3/sealed_game";
import * as leaderboard from "@/contracts/generated/relic-of-lies-v3/deps/contract_v3/leaderboard";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex, toHex } from "@mysten/sui/utils";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// ============== Type Definitions ==============

// Type for parsed SealedGameRoom
type SealedGameRoomType = typeof sealedGame.SealedGameRoom extends {
  $inferType: infer T;
}
  ? T
  : never;

// Type for parsed PlayerStats
type PlayerStatsType = typeof leaderboard.PlayerStats extends {
  $inferType: infer T;
}
  ? T
  : never;

// Type for parsed Leaderboard
type LeaderboardType = typeof leaderboard.Leaderboard extends {
  $inferType: infer T;
}
  ? T
  : never;

// Type for PendingAction
type PendingActionType = typeof sealedGame.PendingAction extends {
  $inferType: infer T;
}
  ? T
  : never;

// ============== Constants ==============

// Game status constants
export const GameStatus = {
  WAITING: 0,
  PLAYING: 1,
  ROUND_END: 2,
  FINISHED: 3,
  PENDING_RESPONSE: 4,
} as const;

// Card type constants (2019 Premium Edition)
export const CardType = {
  SPY: 0,
  GUARD: 1,
  PRIEST: 2,
  BARON: 3,
  HANDMAID: 4,
  PRINCE: 5,
  CHANCELLOR: 6,
  KING: 7,
  COUNTESS: 8,
  PRINCESS: 9,
} as const;

// Card names for display
export const CardNames: Record<number, string> = {
  [CardType.SPY]: "Spy",
  [CardType.GUARD]: "Guard",
  [CardType.PRIEST]: "Priest",
  [CardType.BARON]: "Baron",
  [CardType.HANDMAID]: "Handmaid",
  [CardType.PRINCE]: "Prince",
  [CardType.CHANCELLOR]: "Chancellor",
  [CardType.KING]: "King",
  [CardType.COUNTESS]: "Countess",
  [CardType.PRINCESS]: "Princess",
};

// Pending action type constants
export const PendingActionTypeConst = {
  NONE: 0,
  GUARD_RESPONSE: 1,
  BARON_RESPONSE: 2,
  CHANCELLOR_RESOLVE: 3,
  ROUND_END_REVEAL: 4,
} as const;

// ============== Error Code Mapping ==============

const ErrorCodes: Record<number, string> = {
  // Room Errors (1xx)
  100: "Room name cannot be empty",
  101: "Invalid max players (must be 2-6)",
  102: "Room is full",
  103: "Already in room",
  104: "Not room creator",
  105: "Not enough players",
  106: "Game not finished",
  // Game State Errors (2xx)
  200: "Game already started",
  201: "Game not started",
  202: "Round in progress",
  203: "Pending action - must respond first",
  204: "No pending action",
  // Turn Errors (3xx)
  300: "Not your turn",
  301: "Player eliminated",
  302: "Card not in hand",
  303: "Must discard Countess when holding King or Prince",
  // Target Errors (4xx)
  400: "Target required",
  401: "Invalid target",
  402: "Cannot target self",
  403: "Target eliminated",
  404: "Target immune",
  // Guard Errors (5xx)
  500: "Guess required",
  501: "Invalid guess (cannot guess Guard)",
  // Chancellor Errors (6xx)
  600: "Chancellor pending",
  601: "Chancellor not pending",
  602: "Invalid card selection",
  603: "Must keep exactly one card",
  // Commitment/Seal Errors (7xx)
  700: "Invalid commitment",
  701: "Commitment mismatch - card value doesn't match proof",
  702: "Invalid secret",
  703: "No access to decrypt this card",
  704: "Invalid namespace",
  705: "Card not owned",
  706: "No temporary access",
  707: "Access expired",
  // Response Errors (8xx)
  800: "Not the pending responder",
  801: "Invalid response",
  802: "Response timeout",
};

function parseContractError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message;

    const abortMatch = message.match(/MoveAbort\([^)]+,\s*(\d+)\)/);
    if (abortMatch?.[1] !== undefined) {
      const code = parseInt(abortMatch[1], 10);
      const friendlyMessage =
        ErrorCodes[code] || `Unknown error (code: ${code})`;
      return new Error(friendlyMessage);
    }

    const codeMatch = message.match(/abort_code[:\s]+(\d+)/i);
    if (codeMatch?.[1] !== undefined) {
      const code = parseInt(codeMatch[1], 10);
      const friendlyMessage =
        ErrorCodes[code] || `Unknown error (code: ${code})`;
      return new Error(friendlyMessage);
    }

    return error;
  }

  return new Error("An unknown error occurred");
}

// ============== Seal Integration Types ==============

export interface DecryptedCard {
  cardIndex: number;
  value: number;
  secret: number[];
}

export interface SealConfig {
  serverObjectIds: string[];
  threshold: number;
}

// Default Seal server config (testnet)
export const DEFAULT_SEAL_CONFIG: SealConfig = {
  serverObjectIds: [
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
    "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
  ],
  threshold: 2,
};

// ============== Seal Helper Functions ==============

/**
 * Build Seal ID from room namespace and card index
 */
function buildSealId(namespace: string, cardIndex: number): string {
  const namespaceBytes = fromHex(namespace);
  const cardIndexBytes = new Uint8Array(8);
  const view = new DataView(cardIndexBytes.buffer);
  view.setBigUint64(0, BigInt(cardIndex), false); // big endian

  const nonce = crypto.getRandomValues(new Uint8Array(5));

  const sealId = new Uint8Array([
    ...namespaceBytes,
    ...cardIndexBytes,
    ...nonce,
  ]);
  return toHex(sealId);
}

/**
 * Extract card index from Seal ID
 */
export function extractCardIndexFromSealId(
  sealId: string,
  namespaceLength: number
): number {
  const bytes = fromHex(sealId);
  const cardIndexBytes = bytes.slice(namespaceLength, namespaceLength + 8);
  const view = new DataView(cardIndexBytes.buffer);
  return Number(view.getBigUint64(0, false));
}

// ============== Validation Functions ==============

export function validateCreateRoom(
  name: string,
  maxPlayers: number
): string | null {
  if (!name || name.trim().length === 0) {
    return "Room name cannot be empty";
  }
  if (name.length > 50) {
    return "Room name must be 50 characters or less";
  }
  if (maxPlayers < 2 || maxPlayers > 6) {
    return "Max players must be between 2 and 6";
  }
  return null;
}

export function validateJoinRoom(
  room: SealedGameRoomType | null,
  currentAddress: string | undefined
): string | null {
  if (!room) {
    return "Room not found";
  }
  if (!currentAddress) {
    return "Please connect your wallet first";
  }
  if (room.status !== GameStatus.WAITING) {
    return "Game has already started";
  }
  if (room.players.length >= room.max_players) {
    return "Room is full";
  }
  if (room.players.some((p) => p.addr === currentAddress)) {
    return "You are already in this room";
  }
  return null;
}

export function validateStartRound(
  room: SealedGameRoomType | null,
  currentAddress: string | undefined
): string | null {
  if (!room) {
    return "Room not found";
  }
  if (!currentAddress) {
    return "Please connect your wallet first";
  }
  if (
    room.status !== GameStatus.WAITING &&
    room.status !== GameStatus.ROUND_END
  ) {
    return "Cannot start round in current game state";
  }
  if (room.players.length < 2) {
    return "Need at least 2 players to start";
  }
  const isCreator = room.creator === currentAddress;
  const isPlayer = room.players.some((p) => p.addr === currentAddress);
  if (!isCreator && !isPlayer) {
    return "Only room creator or players can start the round";
  }
  return null;
}

export function validatePlayTurn(
  room: SealedGameRoomType | null,
  currentAddress: string | undefined,
  cardIndex: number,
  _targetIdx: number | null,
  _guess: number | null
): string | null {
  if (!room) {
    return "Room not found";
  }
  if (!currentAddress) {
    return "Please connect your wallet first";
  }
  if (room.status !== GameStatus.PLAYING) {
    return "Game is not in progress";
  }
  if (room.pending_action !== null) {
    return "Pending action must be resolved first";
  }
  if (room.chancellor_pending) {
    return "Chancellor action is pending";
  }

  const playerIdx = room.players.findIndex((p) => p.addr === currentAddress);
  if (playerIdx === -1) {
    return "You are not in this room";
  }

  const player = room.players[playerIdx];
  if (!player) {
    return "Player not found";
  }
  if (!player.is_alive) {
    return "You have been eliminated";
  }

  const currentTurnIdx = Number(room.current_turn) % room.players.length;
  if (currentTurnIdx !== playerIdx) {
    return "It is not your turn";
  }

  // Check if player has this card index
  const hasCard = player.hand.some((h) => Number(h) === cardIndex);
  if (!hasCard) {
    return "Card not in hand";
  }

  return null;
}

// ============== Room Management Hooks ==============

export function useCreateRoomV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3, roomRegistryIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const createRoom = useCallback(
    async (name: string, maxPlayers: number) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      const validationError = validateCreateRoom(name, maxPlayers);
      if (validationError) {
        const err = new Error(validationError);
        toast.error(validationError);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.createRoom({
            package: movePackageIdV3,
            arguments: {
              registry: roomRegistryIdV3,
              name,
              maxPlayers,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        const txResponse = await client.waitForTransaction({
          digest: result.digest,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        const createdRoom = txResponse.objectChanges?.find(
          (change) =>
            change.type === "created" &&
            change.objectType?.includes("::sealed_game::SealedGameRoom")
        );

        toast.success("Room created successfully!");

        return {
          digest: result.digest,
          roomId:
            createdRoom && "objectId" in createdRoom
              ? createdRoom.objectId
              : null,
        };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3, roomRegistryIdV3]
  );

  return {
    createRoom,
    isPending,
    error,
  };
}

export function useGetActiveRoomsV3() {
  const client = useSuiClient();
  const {
    variables: { roomRegistryIdV3 },
  } = useNetworkConfig();
  const [rooms, setRooms] = useState<SealedGameRoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registryData = await client.getObject({
        id: roomRegistryIdV3,
        options: {
          showBcs: true,
        },
      });

      if (
        !registryData.data?.bcs ||
        registryData.data.bcs.dataType !== "moveObject"
      ) {
        throw new Error("Failed to fetch room registry");
      }

      const registry = sealedGame.RoomRegistry.fromBase64(
        registryData.data.bcs.bcsBytes
      );
      const roomIds = registry.active_rooms;

      if (roomIds.length === 0) {
        setRooms([]);
        return [];
      }

      // Convert bigint addresses to strings
      const roomIdStrings = roomIds.map((id) => String(id));

      const roomObjects = await client.multiGetObjects({
        ids: roomIdStrings,
        options: {
          showBcs: true,
        },
      });

      const parsedRooms: SealedGameRoomType[] = [];

      for (const obj of roomObjects) {
        if (obj.data?.bcs && obj.data.bcs.dataType === "moveObject") {
          try {
            const room = sealedGame.SealedGameRoom.fromBase64(
              obj.data.bcs.bcsBytes
            );
            parsedRooms.push(room);
          } catch (e) {
            console.error("Failed to parse room:", e);
          }
        }
      }

      setRooms(parsedRooms);
      return parsedRooms;
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, roomRegistryIdV3]);

  return {
    rooms,
    fetchRooms,
    isLoading,
    error,
  };
}

export function useGetRoomV3(roomId: string | null) {
  const client = useSuiClient();
  const [room, setRoom] = useState<SealedGameRoomType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const roomData = await client.getObject({
        id: roomId,
        options: {
          showBcs: true,
        },
      });

      if (!roomData.data?.bcs || roomData.data.bcs.dataType !== "moveObject") {
        throw new Error("Failed to fetch room");
      }

      const parsedRoom = sealedGame.SealedGameRoom.fromBase64(
        roomData.data.bcs.bcsBytes
      );
      setRoom(parsedRoom);
      return parsedRoom;
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, roomId]);

  return {
    room,
    fetchRoom,
    isLoading,
    error,
  };
}

export function useJoinRoomV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const joinRoom = useCallback(
    async (roomId: string, room?: SealedGameRoomType | null) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (room) {
        const validationError = validateJoinRoom(room, currentAccount.address);
        if (validationError) {
          const err = new Error(validationError);
          toast.error(validationError);
          throw err;
        }
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.joinRoom({
            package: movePackageIdV3,
            arguments: {
              room: roomId,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        toast.success("Joined room successfully!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3]
  );

  return {
    joinRoom,
    isPending,
    error,
  };
}

export function useStartRoundV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const startRound = useCallback(
    async (roomId: string, room?: SealedGameRoomType | null) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (room) {
        const validationError = validateStartRound(
          room,
          currentAccount.address
        );
        if (validationError) {
          const err = new Error(validationError);
          toast.error(validationError);
          throw err;
        }
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.startRound({
            package: movePackageIdV3,
            arguments: {
              room: roomId,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        toast.success("Round started!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3]
  );

  return {
    startRound,
    isPending,
    error,
  };
}

// ============== Sealed Game Play Hooks ==============

/**
 * Hook to play a turn with commitment verification
 * Player must provide the card value and secret for verification
 */
export function usePlayTurnV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3, leaderboardIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const playTurn = useCallback(
    async (
      roomId: string,
      cardIndex: number,
      revealedValue: number,
      secret: number[],
      targetIdx: number | null,
      guess: number | null,
      room?: SealedGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (room) {
        const validationError = validatePlayTurn(
          room,
          currentAccount.address,
          cardIndex,
          targetIdx,
          guess
        );
        if (validationError) {
          const err = new Error(validationError);
          toast.error(validationError);
          throw err;
        }
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.playTurn({
            package: movePackageIdV3,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV3,
              cardIndex: BigInt(cardIndex),
              revealedValue,
              secret,
              targetIdx: targetIdx !== null ? BigInt(targetIdx) : null,
              guess,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        const cardName = CardNames[revealedValue] || "Card";
        toast.success(`Played ${cardName}!`);

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3, leaderboardIdV3]
  );

  return {
    playTurn,
    isPending,
    error,
  };
}

/**
 * Hook to respond to Guard guess
 */
export function useRespondGuardV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3, leaderboardIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondGuard = useCallback(
    async (
      roomId: string,
      cardIndex: number,
      revealedValue: number,
      secret: number[]
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.respondGuard({
            package: movePackageIdV3,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV3,
              cardIndex: BigInt(cardIndex),
              revealedValue,
              secret,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        toast.success("Response submitted!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3, leaderboardIdV3]
  );

  return {
    respondGuard,
    isPending,
    error,
  };
}

/**
 * Hook to respond to Baron comparison
 */
export function useRespondBaronV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3, leaderboardIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondBaron = useCallback(
    async (
      roomId: string,
      cardIndex: number,
      revealedValue: number,
      secret: number[]
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.respondBaron({
            package: movePackageIdV3,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV3,
              cardIndex: BigInt(cardIndex),
              revealedValue,
              secret,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        toast.success("Baron response submitted!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3, leaderboardIdV3]
  );

  return {
    respondBaron,
    isPending,
    error,
  };
}

/**
 * Hook to resolve Chancellor action
 */
export function useResolveChancellorV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3, leaderboardIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const resolveChancellor = useCallback(
    async (
      roomId: string,
      keepCardIndex: number,
      returnIndices: number[],
      room?: SealedGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (room) {
        if (!room.chancellor_pending) {
          const err = new Error("No Chancellor action pending");
          toast.error(err.message);
          throw err;
        }

        const chancellorPlayer =
          room.players[Number(room.chancellor_player_idx)];
        if (chancellorPlayer?.addr !== currentAccount.address) {
          const err = new Error("You are not the Chancellor player");
          toast.error(err.message);
          throw err;
        }
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.resolveChancellor({
            package: movePackageIdV3,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV3,
              keepCardIndex: BigInt(keepCardIndex),
              returnIndices: returnIndices.map((i) => BigInt(i)),
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        toast.success("Chancellor resolved!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3, leaderboardIdV3]
  );

  return {
    resolveChancellor,
    isPending,
    error,
  };
}

// ============== Seal Decryption Hooks ==============

/**
 * Hook to decrypt cards using Seal
 * This is the key hook for viewing your cards
 */
export function useDecryptCards() {
  const currentAccount = useCurrentAccount();
  const [decryptedCards, setDecryptedCards] = useState<DecryptedCard[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decryptCards = useCallback(
    async (
      room: SealedGameRoomType,
      cardIndices: number[],
      _sealConfig: SealConfig = DEFAULT_SEAL_CONFIG
    ): Promise<DecryptedCard[]> => {
      if (!currentAccount) {
        throw new Error("Please connect your wallet first");
      }

      setIsDecrypting(true);
      setError(null);

      try {
        // For now, we'll use the on-chain data directly since secrets are stored
        // In production, this would use Seal SDK to decrypt
        const decrypted: DecryptedCard[] = [];

        for (const cardIndex of cardIndices) {
          // Get card value and secret from room data
          // Note: In production, these would be encrypted and decrypted via Seal
          const value = room.deck_values[cardIndex];
          const secret = room.deck_secrets[cardIndex];

          if (value !== undefined && secret !== undefined) {
            decrypted.push({
              cardIndex,
              value,
              secret: Array.from(secret),
            });
          }
        }

        setDecryptedCards(decrypted);
        return decrypted;
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        throw error;
      } finally {
        setIsDecrypting(false);
      }
    },
    [currentAccount]
  );

  return {
    decryptedCards,
    decryptCards,
    isDecrypting,
    error,
  };
}

/**
 * Hook to build Seal approval transaction for card access
 */
export function useSealApprove() {
  const {
    variables: { movePackageIdV3 },
  } = useNetworkConfig();

  const buildApprovalTx = useCallback(
    (roomId: string, sealId: string): Transaction => {
      const tx = new Transaction();

      tx.add(
        sealedGame.sealApproveCard({
          package: movePackageIdV3,
          arguments: {
            sealId: Array.from(fromHex(sealId)),
            room: roomId,
          },
        })
      );

      return tx;
    },
    [movePackageIdV3]
  );

  return {
    buildApprovalTx,
    buildSealId,
  };
}

// ============== Leaderboard Hooks ==============

export function useGetLeaderboardV3() {
  const client = useSuiClient();
  const {
    variables: { leaderboardIdV3 },
  } = useNetworkConfig();
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await client.getObject({
        id: leaderboardIdV3,
        options: {
          showBcs: true,
        },
      });

      if (!data.data?.bcs || data.data.bcs.dataType !== "moveObject") {
        throw new Error("Failed to fetch leaderboard");
      }

      const parsed = leaderboard.Leaderboard.fromBase64(data.data.bcs.bcsBytes);
      setLeaderboardData(parsed);
      return parsed;
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, leaderboardIdV3]);

  return {
    leaderboard: leaderboardData,
    fetchLeaderboard,
    isLoading,
    error,
  };
}

// ============== Utility Hooks ==============

export function useIsPlayerInRoomV3(room: SealedGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return false;

  return room.players.some((player) => player.addr === currentAccount.address);
}

export function usePlayerIndexV3(room: SealedGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return -1;

  return room.players.findIndex(
    (player) => player.addr === currentAccount.address
  );
}

export function useIsMyTurnV3(room: SealedGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount || room.status !== GameStatus.PLAYING)
    return false;

  const currentTurnIdx = Number(room.current_turn) % room.players.length;
  const currentPlayer = room.players[currentTurnIdx];

  return currentPlayer?.addr === currentAccount.address;
}

export function useMyHandIndicesV3(room: SealedGameRoomType | null) {
  const playerIdx = usePlayerIndexV3(room);

  if (!room || playerIdx === -1) return [];

  return room.players[playerIdx]?.hand.map((h) => Number(h)) ?? [];
}

export function useIsAliveV3(room: SealedGameRoomType | null) {
  const playerIdx = usePlayerIndexV3(room);

  if (!room || playerIdx === -1) return false;

  return room.players[playerIdx]?.is_alive ?? false;
}

export function usePendingActionV3(room: SealedGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) {
    return {
      hasPendingAction: false,
      isResponder: false,
      pendingAction: null,
    };
  }

  const pendingAction = room.pending_action;
  const isResponder = pendingAction?.responder === currentAccount.address;

  return {
    hasPendingAction: pendingAction !== null,
    isResponder,
    pendingAction,
  };
}

export function useChancellorStateV3(room: SealedGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) {
    return {
      isPending: false,
      isChancellorPlayer: false,
      cardIndices: [],
    };
  }

  const chancellorPlayer = room.players[Number(room.chancellor_player_idx)];
  const isChancellorPlayer =
    chancellorPlayer?.addr === currentAccount.address;

  return {
    isPending: room.chancellor_pending,
    isChancellorPlayer,
    cardIndices: room.chancellor_card_indices.map((c) => Number(c)),
  };
}

// ============== Cleanup Hook ==============

export function useCleanupRoomV3() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV3, roomRegistryIdV3 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const cleanupRoom = useCallback(
    async (roomId: string, room?: SealedGameRoomType | null) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (room && room.status !== GameStatus.FINISHED) {
        const err = new Error("Room is not finished yet");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          sealedGame.cleanupFinishedRoom({
            package: movePackageIdV3,
            arguments: {
              registry: roomRegistryIdV3,
              room: roomId,
            },
          })
        );

        const result = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        toast.success("Room cleaned up successfully");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV3, roomRegistryIdV3]
  );

  return {
    cleanupRoom,
    isPending,
    error,
  };
}

// Export types
export type {
  SealedGameRoomType,
  PlayerStatsType,
  LeaderboardType,
  PendingActionType,
};
