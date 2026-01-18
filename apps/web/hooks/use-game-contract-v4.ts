"use client";

import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import * as app from "@/contracts/generated/relic-of-lies-v4/deps/contract_v4/app";
import * as game from "@/contracts/generated/relic-of-lies-v4/deps/contract_v4/game";
import * as leaderboard from "@/contracts/generated/relic-of-lies-v4/deps/contract_v4/leaderboard";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  useEncryptDeck,
  prepareEncryptedDeckForSubmission,
  createPlaintextForVerification,
  type EncryptedCard,
  type DecryptedCard,
} from "./use-seal-client";

// ============== Type Definitions ==============

// Type for parsed GameRoom V4
type GameRoomV4Type = typeof game.GameRoom extends { $inferType: infer T }
  ? T
  : never;

// Type for parsed PlayerRecord
type PlayerRecordType = typeof leaderboard.PlayerRecord extends {
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
type PendingActionTypeInferred = typeof game.PendingAction extends {
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
} as const;

// Pending action types
export const PendingActionType = {
  NONE: 0,
  GUARD_RESPONSE: 1,
  BARON_RESPONSE: 2,
  PRINCE_RESPONSE: 3,
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

// ============== Error Code Mapping ==============

const ErrorCodes: Record<number, string> = {
  // Room Errors
  0: "Room is full",
  1: "Insufficient payment for entry fee",
  2: "Room not found",
  3: "Room name cannot be empty",
  4: "Invalid max players (must be 2-6)",
  5: "Already in room",
  // Game State Errors
  10: "Game has not started yet",
  11: "Game already started",
  12: "Game has finished",
  13: "Game not finished yet",
  14: "Not enough players to start",
  15: "Round not finished",
  16: "Round already in progress",
  17: "Deck not submitted yet",
  18: "Deck already submitted",
  // Turn Errors
  20: "Not your turn",
  21: "Card not in hand",
  22: "Invalid target player",
  23: "Target is immune (Handmaid protection)",
  24: "Cannot target self with this card",
  25: "Must target self with Prince when others immune",
  26: "Target player is eliminated",
  // Card Specific Errors
  30: "Must discard Countess when holding King or Prince",
  31: "Invalid guess",
  32: "Guess is required for Guard card",
  33: "Target is required for this card",
  34: "Cannot guess Guard with Guard",
  // Chancellor Errors
  40: "Must select exactly one card to keep",
  41: "Invalid card selection for Chancellor",
  42: "Chancellor action not pending",
  43: "Chancellor action already pending",
  // Authorization Errors
  50: "Not the room creator",
  51: "Not a player in this room",
  52: "Player is eliminated",
  // Deck Errors
  60: "Deck is empty",
  61: "Invalid deck size",
  // Pending Action Errors
  70: "Pending action exists - must respond first",
  71: "No pending action",
  72: "Not the pending responder",
  73: "Invalid response type",
  // Seal/Decryptable Errors
  80: "Invalid namespace for Seal",
  81: "No access to decrypt this card",
  82: "Card not owned",
  83: "Hash mismatch - decryption verification failed",
  84: "Invalid hash length",
  85: "Invalid nonce length",
  86: "Card already decrypted",
  87: "Card not decrypted yet",
};

/**
 * Parse error message from transaction error
 */
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

// ============== Room Management Hooks ==============

export function useCreateRoomV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, roomRegistryIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const createRoom = useCallback(
    async (name: string, maxPlayers: number) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (!name || name.trim().length === 0) {
        const err = new Error("Room name cannot be empty");
        toast.error(err.message);
        throw err;
      }

      if (maxPlayers < 2 || maxPlayers > 6) {
        const err = new Error("Max players must be between 2 and 6");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          app.createRoom({
            package: movePackageIdV4,
            arguments: {
              registry: roomRegistryIdV4,
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
            change.objectType?.includes("::game::GameRoom")
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
    [client, currentAccount, signAndExecute, movePackageIdV4, roomRegistryIdV4]
  );

  return {
    createRoom,
    isPending,
    error,
  };
}

export function useGetActiveRoomsV4() {
  const client = useSuiClient();
  const {
    variables: { roomRegistryIdV4 },
  } = useNetworkConfig();
  const [rooms, setRooms] = useState<GameRoomV4Type[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const registryData = await client.getObject({
        id: roomRegistryIdV4,
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

      const registry = game.RoomRegistry.fromBase64(
        registryData.data.bcs.bcsBytes
      );
      const roomIds = registry.active_rooms;

      if (roomIds.length === 0) {
        setRooms([]);
        return [];
      }

      const roomObjects = await client.multiGetObjects({
        ids: roomIds,
        options: {
          showBcs: true,
        },
      });

      const parsedRooms: GameRoomV4Type[] = [];

      for (const obj of roomObjects) {
        if (obj.data?.bcs && obj.data.bcs.dataType === "moveObject") {
          try {
            const room = game.GameRoom.fromBase64(obj.data.bcs.bcsBytes);
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
  }, [client, roomRegistryIdV4]);

  return {
    rooms,
    fetchRooms,
    isLoading,
    error,
  };
}

export function useGetRoomV4(roomId: string | null) {
  const client = useSuiClient();
  const [room, setRoom] = useState<GameRoomV4Type | null>(null);
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

      const parsedRoom = game.GameRoom.fromBase64(roomData.data.bcs.bcsBytes);
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

export function useJoinRoomV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          app.joinRoom({
            package: movePackageIdV4,
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
    [client, currentAccount, signAndExecute, movePackageIdV4]
  );

  return {
    joinRoom,
    isPending,
    error,
  };
}

// ============== Deck Submission Hook ==============

export function useSubmitEncryptedDeck() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const { encryptDeck } = useEncryptDeck();
  const [error, setError] = useState<Error | null>(null);
  const [encryptedCards, setEncryptedCards] = useState<EncryptedCard[]>([]);

  const submitDeck = useCallback(
    async (roomId: string) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        toast.info("Encrypting deck...");

        // Encrypt the deck
        const { shuffledDeck, encryptedCards: cards } = await encryptDeck(roomId);
        setEncryptedCards(cards);

        // Prepare data for contract
        const { ciphertexts, hashes, nonces } = prepareEncryptedDeckForSubmission(cards);

        toast.info("Submitting encrypted deck...");

        const tx = new Transaction();

        tx.add(
          app.submitEncryptedDeck({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              ciphertexts,
              hashes,
              nonces,
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

        toast.success("Deck submitted and round started!");

        return { 
          digest: result.digest, 
          shuffledDeck,
          encryptedCards: cards,
        };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV4, encryptDeck]
  );

  return {
    submitDeck,
    isPending,
    error,
    encryptedCards,
  };
}

// ============== Play Turn Hook ==============

export function usePlayTurnV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, leaderboardIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const playTurn = useCallback(
    async (
      roomId: string,
      cardIndex: number,
      cardValue: number,
      targetIdx: number | null,
      guess: number | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        // Create plaintext data for verification
        const plaintextData = Array.from(createPlaintextForVerification(cardValue));
        
        console.log("=== Play Turn Debug ===");
        console.log("cardIndex:", cardIndex);
        console.log("cardValue:", cardValue);
        console.log("plaintextData:", plaintextData);
        console.log("plaintextData hex:", plaintextData.map(b => b.toString(16).padStart(2, '0')).join(''));
        console.log("NOTE: Contract will compute blake2b256(plaintextData || stored_nonce) and compare with stored_hash");

        const tx = new Transaction();

        tx.add(
          app.playTurn({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV4,
              cardIndex,
              plaintextData,
              targetIdx,
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

        const cardName = CardNames[cardValue] || "Card";
        toast.success(`Played ${cardName}!`);

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV4, leaderboardIdV4]
  );

  return {
    playTurn,
    isPending,
    error,
  };
}

// ============== Pending Action Response Hooks ==============

export function useRespondGuardV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, leaderboardIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondGuard = useCallback(
    async (roomId: string, cardIndex: number, cardValue: number) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const plaintextData = Array.from(createPlaintextForVerification(cardValue));

        const tx = new Transaction();

        tx.add(
          app.respondGuard({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV4,
              cardIndex,
              plaintextData,
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

        toast.success("Guard response submitted!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV4, leaderboardIdV4]
  );

  return {
    respondGuard,
    isPending,
    error,
  };
}

export function useRespondBaronV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, leaderboardIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondBaron = useCallback(
    async (roomId: string, cardIndex: number, cardValue: number) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const plaintextData = Array.from(createPlaintextForVerification(cardValue));

        const tx = new Transaction();

        tx.add(
          app.respondBaron({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV4,
              cardIndex,
              plaintextData,
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
    [client, currentAccount, signAndExecute, movePackageIdV4, leaderboardIdV4]
  );

  return {
    respondBaron,
    isPending,
    error,
  };
}

export function useRespondPrinceV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, leaderboardIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondPrince = useCallback(
    async (roomId: string, cardIndex: number, cardValue: number) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const plaintextData = Array.from(createPlaintextForVerification(cardValue));

        const tx = new Transaction();

        tx.add(
          app.respondPrince({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV4,
              cardIndex,
              plaintextData,
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

        toast.success("Prince response submitted!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV4, leaderboardIdV4]
  );

  return {
    respondPrince,
    isPending,
    error,
  };
}

// ============== Chancellor Hook ==============

export function useResolveChancellorV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, leaderboardIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const resolveChancellor = useCallback(
    async (roomId: string, keepCardIndex: number, returnIndices: bigint[]) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          app.resolveChancellor({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV4,
              keepCardIndex,
              returnIndices,
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
    [client, currentAccount, signAndExecute, movePackageIdV4, leaderboardIdV4]
  );

  return {
    resolveChancellor,
    isPending,
    error,
  };
}

// ============== Cleanup Hook ==============

export function useCleanupRoomV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, roomRegistryIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const cleanupRoom = useCallback(
    async (roomId: string) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          app.cleanupRoom({
            package: movePackageIdV4,
            arguments: {
              registry: roomRegistryIdV4,
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
    [client, currentAccount, signAndExecute, movePackageIdV4, roomRegistryIdV4]
  );

  return {
    cleanupRoom,
    isPending,
    error,
  };
}

// ============== Leaderboard Hooks ==============

export function useGetLeaderboardV4() {
  const client = useSuiClient();
  const {
    variables: { leaderboardIdV4 },
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
        id: leaderboardIdV4,
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
  }, [client, leaderboardIdV4]);

  return {
    leaderboard: leaderboardData,
    fetchLeaderboard,
    isLoading,
    error,
  };
}

// ============== Utility Hooks ==============

export function useIsPlayerInRoomV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return false;

  return room.players.some((player) => player.addr === currentAccount.address);
}

export function usePlayerIndexV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return -1;

  return room.players.findIndex(
    (player) => player.addr === currentAccount.address
  );
}

export function useIsMyTurnV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount || room.status !== GameStatus.PLAYING)
    return false;

  const currentTurnIdx = Number(room.current_turn) % room.players.length;
  const currentPlayer = room.players[currentTurnIdx];

  return currentPlayer?.addr === currentAccount.address;
}

export function useMyHandIndicesV4(room: GameRoomV4Type | null) {
  const playerIdx = usePlayerIndexV4(room);

  if (!room || playerIdx === -1) return [];

  return room.players[playerIdx]?.hand ?? [];
}

export function useIsAliveV4(room: GameRoomV4Type | null) {
  const playerIdx = usePlayerIndexV4(room);

  if (!room || playerIdx === -1) return false;

  return room.players[playerIdx]?.is_alive ?? false;
}

export function usePendingActionV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount || !room.pending_action) return null;

  const pending = room.pending_action;
  const isResponder = pending.responder === currentAccount.address;

  return {
    ...pending,
    isResponder,
  };
}

export function useNeedToRespondV4(room: GameRoomV4Type | null) {
  const pendingAction = usePendingActionV4(room);
  return pendingAction?.isResponder ?? false;
}

// Export types
export type { GameRoomV4Type, PlayerRecordType, LeaderboardType, PendingActionTypeInferred, DecryptedCard };
