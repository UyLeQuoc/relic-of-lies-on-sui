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

// Type for DiscardedCardEntry
type DiscardedCardEntryType = typeof game.DiscardedCardEntry extends {
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
  15: "Round in progress",
  16: "Deck already submitted",
  // Turn Errors
  20: "Not your turn",
  21: "Card not in hand",
  22: "Invalid target",
  23: "Target is immune",
  24: "Target is eliminated",
  25: "Must discard Countess",
  26: "Target required",
  27: "Guess required",
  28: "Cannot guess Guard",
  // Chancellor Errors
  40: "Must select exactly one card to keep",
  41: "Invalid card selection for Chancellor",
  42: "Chancellor action not pending",
  43: "Chancellor action already pending",
  44: "Cannot return the card you are keeping",
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
  80: "Hash mismatch - invalid card data",
  81: "Invalid hash length",
  82: "Invalid nonce length",
  83: "Card not decrypted",
  84: "Card already decrypted",
  // Seal Access Errors
  90: "No access to this card",
};

function parseContractError(error: unknown): Error {
  const errorString = String(error);
  
  // Try to extract error code from MoveAbort
  const abortMatch = errorString.match(/MoveAbort.*?(\d+)\)?\s*(?:in command|$)/);
  if (abortMatch) {
    const code = parseInt(abortMatch[1] ?? "0", 10);
    const message = ErrorCodes[code] || `Contract error (code: ${code})`;
    return new Error(message);
  }
  
  // Check for common error patterns
  if (errorString.includes("InsufficientGas")) {
    return new Error("Insufficient gas for transaction");
  }
  if (errorString.includes("InsufficientCoinBalance")) {
    return new Error("Insufficient SUI balance");
  }
  
  return new Error(errorString);
}

// ============== Re-exports ==============

export type {
  GameRoomV4Type,
  PlayerRecordType,
  LeaderboardType,
  PendingActionTypeInferred,
  DiscardedCardEntryType,
  EncryptedCard,
  DecryptedCard,
};

// Re-export BCS structs for parsing
export { game, leaderboard };

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

        await client.waitForTransaction({
          digest: result.digest,
          options: { showEffects: true },
        });

        // Extract room ID from created objects
        const txResponse = await client.getTransactionBlock({
          digest: result.digest,
          options: { showEffects: true, showObjectChanges: true },
        });

        const createdObjects = txResponse.objectChanges?.filter(
          (change) => change.type === "created"
        );

        const roomObject = createdObjects?.find(
          (obj) =>
            obj.type === "created" &&
            obj.objectType.includes("::game::GameRoom")
        );

        const roomId =
          roomObject?.type === "created" ? roomObject.objectId : null;

        toast.success("Room created successfully!");
        return { digest: result.digest, roomId };
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

export function useSubmitDeckV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending: isSubmitting } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const { encryptDeck } = useEncryptDeck();
  const [error, setError] = useState<Error | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const submitDeck = useCallback(
    async (roomId: string) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);
      setIsEncrypting(true);

      try {
        // Encrypt the deck
        toast.info("Encrypting deck...");
        const { encryptedCards } = await encryptDeck(roomId);
        setIsEncrypting(false);

        // Prepare for submission
        const { ciphertexts, hashes, nonces } =
          prepareEncryptedDeckForSubmission(encryptedCards);

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

        toast.success("Deck submitted! Game starting...");
        return { digest: result.digest };
      } catch (err) {
        setIsEncrypting(false);
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
    isPending: isSubmitting || isEncrypting,
    isEncrypting,
    error,
  };
}

// ============== Game Action Hooks ==============

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
      targetIdx: number | null = null,
      guess: number | null = null
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

        const tx = new Transaction();

        tx.add(
          app.playTurn({
            package: movePackageIdV4,
            arguments: {
              room: roomId,
              leaderboard: leaderboardIdV4,
              cardIndex: BigInt(cardIndex),
              plaintextData,
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
              cardIndex: BigInt(cardIndex),
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

        toast.success("Responded to Guard!");
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
              cardIndex: BigInt(cardIndex),
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

        toast.success("Responded to Baron!");
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
              cardIndex: BigInt(cardIndex),
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

        toast.success("Responded to Prince!");
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
    async (roomId: string, keepCardIndex: number, returnIndices: number[]) => {
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
              keepCardIndex: BigInt(keepCardIndex),
              returnIndices: returnIndices.map(BigInt),
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

// ============== Start New Game Hook ==============

export function useStartNewGameV4() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const startNewGame = useCallback(
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
          app.startNewGame({
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

        toast.success("New game started!");
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
    startNewGame,
    isPending,
    error,
  };
}

// ============== Query Hooks ==============

export function useGameRoomV4(roomId: string | null) {
  const client = useSuiClient();
  const [room, setRoom] = useState<GameRoomV4Type | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!roomId) {
      setRoom(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await client.getObject({
        id: roomId,
        options: { showBcs: true },
      });

      if (!response.data?.bcs || response.data.bcs.dataType !== "moveObject") {
        setRoom(null);
        return null;
      }

      const parsed = game.GameRoom.fromBase64(response.data.bcs.bcsBytes);
      setRoom(parsed);
      return parsed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setRoom(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, roomId]);

  return {
    room,
    isLoading,
    error,
    refetch: fetchRoom,
  };
}

export function useActiveRoomsV4() {
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
      // First get the registry to get active room IDs
      const registryResponse = await client.getObject({
        id: roomRegistryIdV4,
        options: { showBcs: true },
      });

      if (!registryResponse.data?.bcs || registryResponse.data.bcs.dataType !== "moveObject") {
        setRooms([]);
        return [];
      }

      const registry = game.RoomRegistry.fromBase64(registryResponse.data.bcs.bcsBytes);
      const roomIds = registry.active_rooms;

      if (roomIds.length === 0) {
        setRooms([]);
        return [];
      }

      // Fetch all rooms
      const roomResponses = await client.multiGetObjects({
        ids: roomIds,
        options: { showBcs: true },
      });

      const parsedRooms: GameRoomV4Type[] = [];
      for (const response of roomResponses) {
        if (response.data?.bcs && response.data.bcs.dataType === "moveObject") {
          try {
            const parsed = game.GameRoom.fromBase64(response.data.bcs.bcsBytes);
            parsedRooms.push(parsed);
          } catch (e) {
            console.warn("Failed to parse room:", e);
          }
        }
      }

      setRooms(parsedRooms);
      return parsedRooms;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setRooms([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, roomRegistryIdV4]);

  return {
    rooms,
    isLoading,
    error,
    refetch: fetchRooms,
  };
}

export function useLeaderboardV4() {
  const client = useSuiClient();
  const {
    variables: { leaderboardIdV4 },
  } = useNetworkConfig();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await client.getObject({
        id: leaderboardIdV4,
        options: { showBcs: true },
      });

      if (!response.data?.bcs || response.data.bcs.dataType !== "moveObject") {
        setLeaderboardData(null);
        return null;
      }

      const parsed = leaderboard.Leaderboard.fromBase64(response.data.bcs.bcsBytes);
      setLeaderboardData(parsed);
      return parsed;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLeaderboardData(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, leaderboardIdV4]);

  return {
    leaderboard: leaderboardData,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  };
}

// ============== Helper Functions ==============

/**
 * Check if a card requires a target
 */
export function cardRequiresTarget(cardValue: number): boolean {
  const targetCards: number[] = [
    CardType.GUARD,
    CardType.PRIEST,
    CardType.BARON,
    CardType.PRINCE,
    CardType.KING,
  ];
  return targetCards.includes(cardValue);
}

/**
 * Check if a card requires a guess (Guard only)
 */
export function cardRequiresGuess(cardValue: number): boolean {
  return cardValue === CardType.GUARD;
}

/**
 * Get valid guess options for Guard (2-9, cannot guess Guard)
 */
export function getValidGuessOptions(): Array<{ value: number; name: string }> {
  return [
    { value: CardType.PRIEST, name: CardNames[CardType.PRIEST] ?? "Priest" },
    { value: CardType.BARON, name: CardNames[CardType.BARON] ?? "Baron" },
    { value: CardType.HANDMAID, name: CardNames[CardType.HANDMAID] ?? "Handmaid" },
    { value: CardType.PRINCE, name: CardNames[CardType.PRINCE] ?? "Prince" },
    { value: CardType.CHANCELLOR, name: CardNames[CardType.CHANCELLOR] ?? "Chancellor" },
    { value: CardType.KING, name: CardNames[CardType.KING] ?? "King" },
    { value: CardType.COUNTESS, name: CardNames[CardType.COUNTESS] ?? "Countess" },
    { value: CardType.PRINCESS, name: CardNames[CardType.PRINCESS] ?? "Princess" },
  ];
}

/**
 * Get card description
 */
export function getCardDescription(cardValue: number): string {
  const descriptions: Record<number, string> = {
    [CardType.SPY]: "If you are the only player with a Spy at the end of the round, gain 1 token.",
    [CardType.GUARD]: "Name a non-Guard card. If the target has that card, they are eliminated.",
    [CardType.PRIEST]: "Look at another player's hand.",
    [CardType.BARON]: "Compare hands with another player. Lower value is eliminated.",
    [CardType.HANDMAID]: "You are immune until your next turn.",
    [CardType.PRINCE]: "Choose a player (including yourself) to discard their hand and draw a new card.",
    [CardType.CHANCELLOR]: "Draw 2 cards, keep 1, return 2 to the bottom of the deck.",
    [CardType.KING]: "Trade hands with another player.",
    [CardType.COUNTESS]: "Must be discarded if you have King or Prince in hand.",
    [CardType.PRINCESS]: "If you discard this card, you are eliminated.",
  };
  return descriptions[cardValue] || "Unknown card";
}

/**
 * Get pending action description
 */
export function getPendingActionDescription(
  actionType: number,
  pendingAction: PendingActionTypeInferred | null
): string {
  if (!pendingAction) return "";

  switch (actionType) {
    case PendingActionType.GUARD_RESPONSE:
      return `Guard guessed ${CardNames[pendingAction.data[0] ?? 0] ?? "Unknown"}. Reveal your card.`;
    case PendingActionType.BARON_RESPONSE:
      return "Baron comparison. Reveal your card.";
    case PendingActionType.PRINCE_RESPONSE:
      return "Prince effect. Discard your hand and draw a new card.";
    default:
      return "Unknown pending action";
  }
}
