"use client";

import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import * as app from "@/contracts/generated_ver2/relic-of-lies-zk/deps/contract/app";
import * as game from "@/contracts/generated_ver2/relic-of-lies-zk/deps/contract/game";
import * as leaderboard from "@/contracts/generated_ver2/relic-of-lies-zk/deps/contract/leaderboard";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// ============== Type Definitions ==============

// Type for parsed ZKGameRoom
type ZKGameRoomType = typeof game.ZKGameRoom extends { $inferType: infer T }
  ? T
  : never;

// Type for parsed Player
type PlayerType = typeof game.Player extends { $inferType: infer T }
  ? T
  : never;

// Type for parsed PendingAction
type PendingActionType = typeof game.PendingAction extends {
  $inferType: infer T;
}
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

// ============== Constants ==============

// Game status constants
export const GameStatus = {
  WAITING: 0,
  PLAYING: 1,
  ROUND_END: 2,
  FINISHED: 3,
  PENDING_PROOF: 4,
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

// Action types for pending actions
export const ActionType = {
  NONE: 0,
  GUARD_PENDING: 1,
  BARON_PENDING: 2,
  PRIEST_PENDING: 3,
  PRINCE_PENDING: 4,
  KING_PENDING: 5,
  CHANCELLOR_PENDING: 6,
} as const;

// Baron comparison results
export const BaronResult = {
  INITIATOR_WINS: 0,
  TARGET_WINS: 1,
  TIE: 2,
} as const;

// ============== Error Code Mapping ==============

// Error codes from the smart contract (ZK version)
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
  // ZK-specific Errors
  70: "Invalid ZK proof",
  71: "Invalid commitment",
  72: "Proof timeout not reached",
  73: "No pending action",
  74: "Action already pending",
  75: "Not the pending action target",
  76: "Wrong action type",
  77: "Invalid commitment size",
  78: "Not the dealer",
  79: "Invalid commitments count",
};

/**
 * Parse error message from transaction error
 * Extracts the abort code and returns a user-friendly message
 */
function parseContractError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message;

    // Try to extract abort code from error message
    // Format: "MoveAbort(MoveLocation { module: ..., function: ... }, <code>)"
    const abortMatch = message.match(/MoveAbort\([^)]+,\s*(\d+)\)/);
    if (abortMatch?.[1] !== undefined) {
      const code = parseInt(abortMatch[1], 10);
      const friendlyMessage =
        ErrorCodes[code] || `Unknown error (code: ${code})`;
      return new Error(friendlyMessage);
    }

    // Alternative format: "abort_code: <code>"
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

// ============== Game Validation Functions ==============

/**
 * Validate room creation parameters
 */
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

/**
 * Validate if a player can join a room
 */
export function validateJoinRoom(
  room: ZKGameRoomType | null,
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

/**
 * Validate if a round can be started
 */
export function validateStartRound(
  room: ZKGameRoomType | null,
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
  // In ZK version, dealer (creator) starts the round
  if (room.creator !== currentAddress) {
    return "Only the dealer (room creator) can start the round";
  }
  return null;
}

/**
 * Validate if a turn can be played (ZK version)
 * Note: In ZK version, we can't validate card ownership client-side
 */
export function validatePlayTurn(
  room: ZKGameRoomType | null,
  currentAddress: string | undefined,
  card: number,
  targetIdx: number | null,
  guess: number | null
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
  if (room.chancellor_pending) {
    return "Chancellor action is pending";
  }
  if (room.pending_action) {
    return "Another action is pending proof submission";
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

  // Card validation
  if (card < 0 || card > 9) {
    return "Invalid card";
  }

  // Card-specific validation
  const cardsNeedingTarget = [
    CardType.GUARD,
    CardType.PRIEST,
    CardType.BARON,
    CardType.KING,
  ] as number[];
  const needsTarget = cardsNeedingTarget.includes(card);
  const needsGuess = card === CardType.GUARD;

  // Check if all other players are immune or eliminated
  const validTargets = room.players.filter(
    (p, idx) => idx !== playerIdx && p.is_alive && !p.is_immune
  );
  const allOthersImmune = validTargets.length === 0;

  if (needsTarget && !allOthersImmune) {
    if (targetIdx === null || targetIdx === undefined) {
      return "Target is required for this card";
    }
    if (targetIdx < 0 || targetIdx >= room.players.length) {
      return "Invalid target";
    }
    if (targetIdx === playerIdx && card !== CardType.PRINCE) {
      return "Cannot target yourself with this card";
    }
    const target = room.players[targetIdx];
    if (!target?.is_alive) {
      return "Target player is eliminated";
    }
    if (target.is_immune) {
      return "Target is protected by Handmaid";
    }
  }

  if (needsGuess && !allOthersImmune) {
    if (guess === null || guess === undefined) {
      return "Guess is required for Guard";
    }
    if (guess === CardType.GUARD) {
      return "Cannot guess Guard with Guard";
    }
    if (guess < 0 || guess > 9) {
      return "Invalid guess";
    }
  }

  // Prince can target self
  if (card === CardType.PRINCE && targetIdx !== null) {
    if (targetIdx < 0 || targetIdx >= room.players.length) {
      return "Invalid target";
    }
    const target = room.players[targetIdx];
    if (!target?.is_alive) {
      return "Target player is eliminated";
    }
    if (targetIdx !== playerIdx && target.is_immune) {
      return "Target is protected by Handmaid";
    }
  }

  return null;
}

/**
 * Validate pending action response
 */
export function validatePendingActionResponse(
  room: ZKGameRoomType | null,
  currentAddress: string | undefined,
  expectedActionType: number
): string | null {
  if (!room) {
    return "Room not found";
  }
  if (!currentAddress) {
    return "Please connect your wallet first";
  }
  if (!room.pending_action) {
    return "No pending action";
  }
  if (room.pending_action.action_type !== expectedActionType) {
    return "Wrong action type";
  }

  const targetIdx = Number(room.pending_action.target_idx);
  const targetPlayer = room.players[targetIdx];
  if (targetPlayer?.addr !== currentAddress) {
    return "You are not the target of this action";
  }

  return null;
}

// ============== Room Management Hooks ==============

export function useCreateRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, roomRegistryIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const createRoom = useCallback(
    async (name: string, maxPlayers: number) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate input
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
          app.createRoom({
            package: movePackageIdV2,
            arguments: {
              registry: roomRegistryIdV2,
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

        // Find the created room ID from object changes
        const createdRoom = txResponse.objectChanges?.find(
          (change) =>
            change.type === "created" &&
            change.objectType?.includes("::game::ZKGameRoom")
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
    [client, currentAccount, signAndExecute, movePackageIdV2, roomRegistryIdV2]
  );

  return {
    createRoom,
    isPending,
    error,
  };
}

// Hook to get active rooms from the registry
export function useGetActiveRooms() {
  const client = useSuiClient();
  const {
    variables: { roomRegistryIdV2 },
  } = useNetworkConfig();
  const [rooms, setRooms] = useState<ZKGameRoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the RoomRegistry object to get active room IDs
      const registryData = await client.getObject({
        id: roomRegistryIdV2,
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

      // Fetch all room objects
      const roomObjects = await client.multiGetObjects({
        ids: roomIds,
        options: {
          showBcs: true,
        },
      });

      const parsedRooms: ZKGameRoomType[] = [];

      for (const obj of roomObjects) {
        if (obj.data?.bcs && obj.data.bcs.dataType === "moveObject") {
          try {
            const room = game.ZKGameRoom.fromBase64(obj.data.bcs.bcsBytes);
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
  }, [client, roomRegistryIdV2]);

  return {
    rooms,
    fetchRooms,
    isLoading,
    error,
  };
}

// Hook to get a single room by ID
export function useGetRoom(roomId: string | null) {
  const client = useSuiClient();
  const [room, setRoom] = useState<ZKGameRoomType | null>(null);
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

      const parsedRoom = game.ZKGameRoom.fromBase64(roomData.data.bcs.bcsBytes);
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

// Hook to join a room
export function useJoinRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const joinRoom = useCallback(
    async (roomId: string, room?: ZKGameRoomType | null) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate if room data is provided
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
          app.joinRoom({
            package: movePackageIdV2,
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
    [client, currentAccount, signAndExecute, movePackageIdV2]
  );

  return {
    joinRoom,
    isPending,
    error,
  };
}

// Hook to start a round (ZK version - dealer provides commitments)
export function useStartRound() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const startRound = useCallback(
    async (
      roomId: string,
      deckCommitment: number[],
      playerCommitments: number[][],
      publicCards: number[],
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate if room data is provided
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
          app.startRound({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              deckCommitment,
              playerCommitments,
              publicCards,
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
    [client, currentAccount, signAndExecute, movePackageIdV2]
  );

  return {
    startRound,
    isPending,
    error,
  };
}

// Hook to update player's card commitment (after drawing)
export function useUpdateCommitment() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const updateCommitment = useCallback(
    async (roomId: string, newCommitment: number[]) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          app.updateCommitment({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              newCommitment,
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

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV2]
  );

  return {
    updateCommitment,
    isPending,
    error,
  };
}

// Hook to play a turn (ZK version)
export function usePlayTurn() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const playTurn = useCallback(
    async (
      roomId: string,
      card: number,
      newCommitment: number[],
      targetIdx: number | null,
      guess: number | null,
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate if room data is provided
      if (room) {
        const validationError = validatePlayTurn(
          room,
          currentAccount.address,
          card,
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
          app.playTurn({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              card,
              newCommitment,
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

        const cardName = CardNames[card] || "Card";
        toast.success(`Played ${cardName}!`);

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV2]
  );

  return {
    playTurn,
    isPending,
    error,
  };
}

// Hook to respond to Guard with ZK proof
export function useRespondGuard() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, leaderboardIdV2, zkVerificationKeysId },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondGuard = useCallback(
    async (
      roomId: string,
      proof: number[],
      isCorrect: boolean,
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate pending action
      if (room) {
        const validationError = validatePendingActionResponse(
          room,
          currentAccount.address,
          ActionType.GUARD_PENDING
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
          app.respondGuard({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV2,
              vk: zkVerificationKeysId,
              proof,
              isCorrect,
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

        if (isCorrect) {
          toast.success("Guard guess was correct! You are eliminated.");
        } else {
          toast.success("Guard guess was wrong! You are safe.");
        }

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [
      client,
      currentAccount,
      signAndExecute,
      movePackageIdV2,
      leaderboardIdV2,
      zkVerificationKeysId,
    ]
  );

  return {
    respondGuard,
    isPending,
    error,
  };
}

// Hook to respond to Baron with ZK proof
export function useRespondBaron() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, leaderboardIdV2, zkVerificationKeysId },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondBaron = useCallback(
    async (
      roomId: string,
      proof: number[],
      result: number, // 0 = initiator wins, 1 = target wins, 2 = tie
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate pending action
      if (room) {
        const validationError = validatePendingActionResponse(
          room,
          currentAccount.address,
          ActionType.BARON_PENDING
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
          app.respondBaron({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV2,
              vk: zkVerificationKeysId,
              proof,
              result,
            },
          })
        );

        const txResult = await signAndExecute({
          transaction: tx,
        });

        await client.waitForTransaction({
          digest: txResult.digest,
          options: { showEffects: true },
        });

        const resultMessages = {
          [BaronResult.INITIATOR_WINS]: "Baron comparison: Initiator wins!",
          [BaronResult.TARGET_WINS]: "Baron comparison: Target wins!",
          [BaronResult.TIE]: "Baron comparison: It's a tie!",
        };
        toast.success(resultMessages[result] || "Baron comparison complete!");

        return { digest: txResult.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [
      client,
      currentAccount,
      signAndExecute,
      movePackageIdV2,
      leaderboardIdV2,
      zkVerificationKeysId,
    ]
  );

  return {
    respondBaron,
    isPending,
    error,
  };
}

// Hook to respond to Prince effect
export function useRespondPrince() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, leaderboardIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondPrince = useCallback(
    async (
      roomId: string,
      discardedCard: number,
      newCommitment: number[],
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate pending action
      if (room) {
        const validationError = validatePendingActionResponse(
          room,
          currentAccount.address,
          ActionType.PRINCE_PENDING
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
          app.respondPrince({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV2,
              discardedCard,
              newCommitment,
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

        const cardName = CardNames[discardedCard] || "Card";
        if (discardedCard === CardType.PRINCESS) {
          toast.success(`Discarded ${cardName}! You are eliminated.`);
        } else {
          toast.success(`Discarded ${cardName} and drew a new card.`);
        }

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV2, leaderboardIdV2]
  );

  return {
    respondPrince,
    isPending,
    error,
  };
}

// Hook to respond to King swap
export function useRespondKing() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, leaderboardIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const respondKing = useCallback(
    async (
      roomId: string,
      initiatorNewCommitment: number[],
      targetNewCommitment: number[],
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate pending action
      if (room) {
        const validationError = validatePendingActionResponse(
          room,
          currentAccount.address,
          ActionType.KING_PENDING
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
          app.respondKing({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV2,
              initiatorNewCommitment,
              targetNewCommitment,
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

        toast.success("Cards swapped successfully!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV2, leaderboardIdV2]
  );

  return {
    respondKing,
    isPending,
    error,
  };
}

// Hook to resolve Chancellor action
export function useResolveChancellor() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, leaderboardIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const resolveChancellor = useCallback(
    async (
      roomId: string,
      newCommitment: number[],
      cardsReturned: number,
      room?: ZKGameRoomType | null
    ) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate chancellor pending
      if (room && !room.chancellor_pending) {
        const err = new Error("No Chancellor action pending");
        toast.error(err.message);
        throw err;
      }

      if (room) {
        const chancellorPlayer = room.players[Number(room.chancellor_player_idx)];
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
          app.resolveChancellor({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV2,
              newCommitment,
              cardsReturned,
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

        toast.success("Chancellor action resolved!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV2, leaderboardIdV2]
  );

  return {
    resolveChancellor,
    isPending,
    error,
  };
}

// Hook to handle timeout for pending actions
export function useHandleTimeout() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV2, leaderboardIdV2 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const handleTimeout = useCallback(
    async (roomId: string, room?: ZKGameRoomType | null) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      // Validate pending action exists
      if (room && !room.pending_action) {
        const err = new Error("No pending action to timeout");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        tx.add(
          app.handleTimeout({
            package: movePackageIdV2,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV2,
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

        toast.success("Timeout handled - player eliminated for not responding!");

        return { digest: result.digest };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV2, leaderboardIdV2]
  );

  return {
    handleTimeout,
    isPending,
    error,
  };
}

// ============== Leaderboard Hooks ==============

// Hook to get leaderboard data
export function useGetLeaderboard() {
  const client = useSuiClient();
  const {
    variables: { leaderboardIdV2 },
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
        id: leaderboardIdV2,
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
  }, [client, leaderboardIdV2]);

  return {
    leaderboard: leaderboardData,
    fetchLeaderboard,
    isLoading,
    error,
  };
}

// Hook to get top players
export function useGetTopPlayers(count: number = 10) {
  const {
    leaderboard: leaderboardData,
    fetchLeaderboard,
    isLoading,
    error,
  } = useGetLeaderboard();

  const topPlayers = leaderboardData?.records.slice(0, count) ?? [];

  return {
    topPlayers,
    fetchTopPlayers: fetchLeaderboard,
    isLoading,
    error,
  };
}

// ============== Utility Hooks ==============

// Hook to check if current user is in a room
export function useIsPlayerInRoom(room: ZKGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return false;

  return room.players.some((player) => player.addr === currentAccount.address);
}

// Hook to get current player's index in room
export function usePlayerIndex(room: ZKGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return -1;

  return room.players.findIndex(
    (player) => player.addr === currentAccount.address
  );
}

// Hook to check if it's current player's turn
export function useIsMyTurn(room: ZKGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount || room.status !== GameStatus.PLAYING)
    return false;

  const currentTurnIdx = Number(room.current_turn) % room.players.length;
  const currentPlayer = room.players[currentTurnIdx];

  return currentPlayer?.addr === currentAccount.address;
}

// Hook to get current player's commitment
export function useMyCommitment(room: ZKGameRoomType | null) {
  const playerIdx = usePlayerIndex(room);

  if (!room || playerIdx === -1) return null;

  return room.players[playerIdx]?.card_commitment ?? null;
}

// Hook to get current player's hand count
export function useMyHandCount(room: ZKGameRoomType | null) {
  const playerIdx = usePlayerIndex(room);

  if (!room || playerIdx === -1) return 0;

  return room.players[playerIdx]?.hand_count ?? 0;
}

// Hook to check if current player is alive
export function useIsAlive(room: ZKGameRoomType | null) {
  const playerIdx = usePlayerIndex(room);

  if (!room || playerIdx === -1) return false;

  return room.players[playerIdx]?.is_alive ?? false;
}

// Hook to check if there's a pending action for current player
export function useHasPendingAction(room: ZKGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount || !room.pending_action) return false;

  const targetIdx = Number(room.pending_action.target_idx);
  const targetPlayer = room.players[targetIdx];

  return targetPlayer?.addr === currentAccount.address;
}

// Hook to get pending action details
export function usePendingAction(room: ZKGameRoomType | null) {
  if (!room || !room.pending_action) return null;

  return {
    actionType: room.pending_action.action_type,
    initiatorIdx: Number(room.pending_action.initiator_idx),
    targetIdx: Number(room.pending_action.target_idx),
    guess: room.pending_action.guess,
    deadline: Number(room.pending_action.deadline),
    extraData: room.pending_action.extra_data,
  };
}

// Hook to check if current player is the dealer
export function useIsDealer(room: ZKGameRoomType | null) {
  const currentAccount = useCurrentAccount();

  if (!room || !currentAccount) return false;

  return room.dealer === currentAccount.address;
}

// Export the types for use in components
export type {
  ZKGameRoomType,
  PlayerType,
  PendingActionType,
  PlayerRecordType,
  LeaderboardType,
};
