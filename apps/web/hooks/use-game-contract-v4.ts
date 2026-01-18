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

// Card type constants ()
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

// Card names for display - Relic of Lies theme
export const CardNames: Record<number, string> = {
  [CardType.SPY]: "Scout",
  [CardType.GUARD]: "Knight",
  [CardType.PRIEST]: "Healer",
  [CardType.BARON]: "Berserker",
  [CardType.HANDMAID]: "Cleric",
  [CardType.PRINCE]: "Wizard",
  [CardType.CHANCELLOR]: "Tactician",
  [CardType.KING]: "Paladin",
  [CardType.COUNTESS]: "Cursed Idol",
  [CardType.PRINCESS]: "Sacred Crystal",
};

// ============== Error Code Mapping ==============

const ErrorCodes: Record<number, string> = {
  // Room Errors (0-9)
  0: "Room is full",
  1: "Insufficient payment for entry fee",
  2: "Room not found",
  3: "Room name cannot be empty",
  4: "Invalid max players (must be 2-6)",
  5: "Already in room",
  // Game State Errors (10-19)
  10: "Game has not started yet",
  11: "Game already started",
  12: "Game has finished",
  13: "Game not finished yet",
  14: "Not enough players to start",
  15: "Round not finished",
  16: "Round in progress",
  17: "Deck not submitted yet",
  18: "Deck already submitted",
  // Turn Errors (20-29)
  20: "Not your turn",
  21: "Card not in hand",
  22: "Invalid target",
  23: "Target is immune",
  24: "Cannot target self with this card",
  25: "Must target self with Prince when others immune",
  26: "Target is eliminated",
  // Card Specific Errors (30-39)
  30: "Must discard Countess when holding King or Prince",
  31: "Invalid guess",
  32: "Guess is required for Guard card",
  33: "Target is required for this card",
  34: "Cannot guess Guard with Guard",
  // Chancellor Errors (40-49)
  40: "Must select exactly one card to keep",
  41: "Invalid card selection for Chancellor",
  42: "Chancellor action not pending",
  43: "Chancellor action already pending",
  44: "Cannot return the card you are keeping",
  // Authorization Errors (50-59)
  50: "Not the room creator",
  51: "Not a player in this room",
  52: "Player is eliminated",
  // Deck Errors (60-69)
  60: "Deck is empty",
  61: "Invalid deck size",
  // Pending Action Errors (70-79)
  70: "Pending action exists - must respond first",
  71: "No pending action",
  72: "Not the pending responder",
  73: "Invalid response type",
  // Seal/Decryptable Errors (80-89)
  80: "Invalid namespace for Seal",
  81: "No access to decrypt this card",
  82: "Card not owned",
  83: "Hash mismatch - decryption verification failed",
  84: "Invalid hash length",
  85: "Invalid nonce length",
  86: "Card already decrypted",
  87: "Card not decrypted yet",
};

function parseContractError(error: unknown): Error {
  const errorString = String(error);
  
  console.log("Parsing contract error:", errorString);
  
  // Try multiple patterns to extract error code from MoveAbort
  // Pattern 1: MoveAbort(..., ERROR_CODE) - standard format
  const abortMatch = errorString.match(/MoveAbort[^)]*,\s*(\d+)\)/);
  if (abortMatch?.[1]) {
    const code = parseInt(abortMatch[1], 10);
    const message = ErrorCodes[code] || `Contract error (code: ${code})`;
    console.log(`Parsed error code: ${code}, message: ${message}`);
    return new Error(message);
  }
  
  // Pattern 2: abort_code: NUMBER
  const altMatch = errorString.match(/abort_code:\s*(\d+)/i);
  if (altMatch?.[1]) {
    const code = parseInt(altMatch[1], 10);
    const message = ErrorCodes[code] || `Contract error (code: ${code})`;
    return new Error(message);
  }
  
  // Pattern 3: error code NUMBER or code: NUMBER
  const codeMatch = errorString.match(/(?:error\s+)?code[:\s]+(\d+)/i);
  if (codeMatch?.[1]) {
    const code = parseInt(codeMatch[1], 10);
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
  if (errorString.includes("Dry run failed")) {
    // Try to extract more specific error from dry run failure
    const dryRunMatch = errorString.match(/MoveAbort.*?(\d+)/);
    if (dryRunMatch?.[1]) {
      const code = parseInt(dryRunMatch[1], 10);
      const message = ErrorCodes[code] || `Contract error (code: ${code})`;
      return new Error(message);
    }
    return new Error("Transaction simulation failed. Please check game state and try again.");
  }
  
  // Return original error if no pattern matched
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
        let encryptedCards: EncryptedCard[];
        try {
          const encryptResult = await encryptDeck(roomId);
          encryptedCards = encryptResult.encryptedCards;
        } catch (encryptErr) {
          console.error("Encryption failed:", encryptErr);
          throw new Error(`Failed to encrypt deck: ${encryptErr instanceof Error ? encryptErr.message : String(encryptErr)}`);
        }
        setIsEncrypting(false);

        // Prepare for submission
        const { ciphertexts, hashes, nonces } =
          prepareEncryptedDeckForSubmission(encryptedCards);

        console.log("Submitting deck with", ciphertexts.length, "cards");
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
    { value: CardType.PRIEST, name: CardNames[CardType.PRIEST] ?? "Healer" },
    { value: CardType.BARON, name: CardNames[CardType.BARON] ?? "Berserker" },
    { value: CardType.HANDMAID, name: CardNames[CardType.HANDMAID] ?? "Cleric" },
    { value: CardType.PRINCE, name: CardNames[CardType.PRINCE] ?? "Wizard" },
    { value: CardType.CHANCELLOR, name: CardNames[CardType.CHANCELLOR] ?? "Tactician" },
    { value: CardType.KING, name: CardNames[CardType.KING] ?? "Paladin" },
    { value: CardType.COUNTESS, name: CardNames[CardType.COUNTESS] ?? "Cursed Idol" },
    { value: CardType.PRINCESS, name: CardNames[CardType.PRINCESS] ?? "Sacred Crystal" },
  ];
}

/**
 * Get card description - Relic of Lies theme
 */
export function getCardDescription(cardValue: number): string {
  const descriptions: Record<number, string> = {
    [CardType.SPY]: "If you are the only player with a Scout at the end of the round, gain 1 Relic.",
    [CardType.GUARD]: "Name a non-Knight card. If the target has that card, they are eliminated.",
    [CardType.PRIEST]: "Look at another player's hand.",
    [CardType.BARON]: "Compare hands with another player. Lower value is eliminated.",
    [CardType.HANDMAID]: "You are immune until your next turn.",
    [CardType.PRINCE]: "Choose a player (including yourself) to discard their hand and draw a new card.",
    [CardType.CHANCELLOR]: "Draw 2 cards. Keep one and place the others at bottom in any order.",
    [CardType.KING]: "Choose and swap your hand with another player's hand.",
    [CardType.COUNTESS]: "Must be discarded if held with Wizard or Paladin. Otherwise, no effect.",
    [CardType.PRINCESS]: "If you play or discard this card, you are immediately eliminated.",
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
      return `Knight guessed ${CardNames[pendingAction.data[0] ?? 0] ?? "Unknown"}. Reveal your card.`;
    case PendingActionType.BARON_RESPONSE:
      return "Berserker comparison. Reveal your card.";
    case PendingActionType.PRINCE_RESPONSE:
      return "Wizard effect. Discard your hand and draw a new card.";
    default:
      return "Unknown pending action";
  }
}

// ============== Derived State Hooks ==============

/**
 * Hook to get player index in room
 */
export function usePlayerIndexV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return -1;
  
  const index = room.players.findIndex(
    (p) => p.addr === currentAccount.address
  );
  return index;
}

/**
 * Hook to check if it's current user's turn
 */
export function useIsMyTurnV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return false;
  if (room.status !== GameStatus.PLAYING) return false;
  
  const currentPlayerIdx = Number(room.current_turn) % room.players.length;
  const currentPlayer = room.players[currentPlayerIdx];
  
  return currentPlayer?.addr === currentAccount.address;
}

/**
 * Hook to get current user's hand indices
 */
export function useMyHandIndicesV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return [];
  
  const player = room.players.find((p) => p.addr === currentAccount.address);
  return player?.hand.map(Number) ?? [];
}

/**
 * Hook to get pending action info
 */
export function usePendingActionV4(room: GameRoomV4Type | null) {
  if (!room || !room.pending_action) return null;
  return room.pending_action;
}

/**
 * Hook to check if current user needs to respond to pending action
 */
export function useNeedToRespondV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount || !room.pending_action) return false;
  
  return room.pending_action.responder === currentAccount.address;
}

/**
 * Hook to check if current user is in room
 */
export function useIsPlayerInRoomV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return false;
  
  return room.players.some((p) => p.addr === currentAccount.address);
}

/**
 * Hook to check if current user is alive
 */
export function useIsAliveV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return false;
  
  const player = room.players.find((p) => p.addr === currentAccount.address);
  return player?.is_alive ?? false;
}

/**
 * Hook to check if chancellor action is pending for current user
 */
export function useChancellorPendingV4(room: GameRoomV4Type | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount || !room.chancellor_pending) return false;
  
  const chancellorPlayer = room.players[Number(room.chancellor_player_idx)];
  return chancellorPlayer?.addr === currentAccount.address;
}

/**
 * Hook to get chancellor card indices
 */
export function useChancellorCardIndicesV4(room: GameRoomV4Type | null) {
  if (!room || !room.chancellor_pending) return [];
  return room.chancellor_card_indices.map(Number);
}

// ============== Alias Hooks for Backward Compatibility ==============

// Alias for useGameRoomV4
export function useGetRoomV4(roomId: string | null) {
  const result = useGameRoomV4(roomId);
  return {
    room: result.room,
    fetchRoom: result.refetch,
    isLoading: result.isLoading,
    error: result.error,
  };
}

// Alias for useActiveRoomsV4
export function useGetActiveRoomsV4() {
  const result = useActiveRoomsV4();
  return {
    rooms: result.rooms,
    fetchRooms: result.refetch,
    isLoading: result.isLoading,
    error: result.error,
  };
}

// Alias for useSubmitDeckV4
export function useSubmitEncryptedDeck() {
  return useSubmitDeckV4();
}

// ============== Gacha Constants ==============

// Gacha cost: 0.01 SUI per pull
export const GACHA_COST = BigInt(10_000_000);

// Rarity constants
export const Rarity = {
  COMMON: 0,
  RARE: 1,
  EPIC: 2,
  LEGENDARY: 3,
  MYTHIC: 4,
} as const;

// Rarity names for display
export const RarityNames: Record<number, string> = {
  [Rarity.COMMON]: "Common",
  [Rarity.RARE]: "Rare",
  [Rarity.EPIC]: "Epic",
  [Rarity.LEGENDARY]: "Legendary",
  [Rarity.MYTHIC]: "Mythic",
};

// Rarity colors for display
export const RarityColors: Record<number, string> = {
  [Rarity.COMMON]: "text-gray-400",
  [Rarity.RARE]: "text-blue-400",
  [Rarity.EPIC]: "text-purple-400",
  [Rarity.LEGENDARY]: "text-yellow-400",
  [Rarity.MYTHIC]: "text-red-400",
};

// Upgrade success rates (%)
export const UpgradeRates: Record<number, number> = {
  [Rarity.COMMON]: 80, // Common → Rare: 80%
  [Rarity.RARE]: 60, // Rare → Epic: 60%
  [Rarity.EPIC]: 40, // Epic → Legendary: 40%
  [Rarity.LEGENDARY]: 20, // Legendary → Mythic: 20%
  [Rarity.MYTHIC]: 0, // Cannot upgrade
};

// ============== Gacha Types ==============

// Card NFT type (matches contract struct)
export interface CardNFT {
  id: { id: string };
  value: number;
  rarity: number;
  wins: bigint;
  games_played: bigint;
}

// ============== Gacha Hooks ==============

// Hook to pull cards from gacha (supports multiple pulls)
export function useGachaPull() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4, gachaTreasuryIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const pull = useCallback(
    async (amount: number = 1) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      if (amount < 1) {
        const err = new Error("Amount must be at least 1");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        // Calculate total cost: 0.01 SUI per pull
        const totalCost = GACHA_COST * BigInt(amount);

        // Split coin for gacha cost
        const [paymentCoin] = tx.splitCoins(tx.gas, [totalCost]);

        // Call gacha pull_and_keep with amount
        tx.moveCall({
          target: `${movePackageIdV4}::gacha::pull_and_keep`,
          arguments: [
            tx.object(gachaTreasuryIdV4),
            paymentCoin,
            tx.pure.u64(amount),
            tx.object("0x8"), // Random object
          ],
        });

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

        // Find all created cards from object changes
        const createdCards =
          txResponse.objectChanges?.filter(
            (change) =>
              change.type === "created" &&
              change.objectType?.includes("::gacha::Card")
          ) ?? [];

        const cardIds = createdCards
          .map((card) => ("objectId" in card ? card.objectId : null))
          .filter((id): id is string => id !== null);

        toast.success(
          `${amount} card${amount > 1 ? "s" : ""} pulled successfully!`
        );

        return {
          digest: result.digest,
          cardIds,
        };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        toast.error(error.message);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV4, gachaTreasuryIdV4]
  );

  return {
    pull,
    isPending,
    error,
  };
}

// Hook to upgrade cards
export function useGachaUpgrade() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const upgrade = useCallback(
    async (card1Id: string, card2Id: string, card3Id: string) => {
      if (!currentAccount) {
        const err = new Error("Please connect your wallet first");
        toast.error(err.message);
        throw err;
      }

      setError(null);

      try {
        const tx = new Transaction();

        // Call gacha upgrade_and_keep
        tx.moveCall({
          target: `${movePackageIdV4}::gacha::upgrade_and_keep`,
          arguments: [
            tx.object(card1Id),
            tx.object(card2Id),
            tx.object(card3Id),
            tx.object("0x8"), // Random object
          ],
        });

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

        // Find the created card from object changes
        const createdCard = txResponse.objectChanges?.find(
          (change) =>
            change.type === "created" &&
            change.objectType?.includes("::gacha::Card")
        );

        return {
          digest: result.digest,
          cardId:
            createdCard && "objectId" in createdCard
              ? createdCard.objectId
              : null,
        };
      } catch (err) {
        const error = parseContractError(err);
        setError(error);
        throw error;
      }
    },
    [client, currentAccount, signAndExecute, movePackageIdV4]
  );

  return {
    upgrade,
    isPending,
    error,
  };
}

// Hook to get user's cards
export function useGetMyCards() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();
  const [cards, setCards] = useState<CardNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCards = useCallback(async () => {
    if (!currentAccount) {
      setCards([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all Card objects owned by the user
      const response = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${movePackageIdV4}::gacha::Card`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      const parsedCards: CardNFT[] = [];

      for (const obj of response.data) {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as Record<string, unknown>;
          parsedCards.push({
            id: { id: obj.data.objectId },
            value: Number(fields.value),
            rarity: Number(fields.rarity),
            wins: BigInt((fields.wins as string) || "0"),
            games_played: BigInt((fields.games_played as string) || "0"),
          });
        }
      }

      setCards(parsedCards);
      return parsedCards;
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, currentAccount, movePackageIdV4]);

  return {
    cards,
    fetchCards,
    isLoading,
    error,
  };
}
