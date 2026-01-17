'use client';

import { useNetworkConfig } from '@/app/(root)/_components/sui-provider';
import * as app from '@/contracts/generated/relic-of-lies/deps/contract/app';
import * as game from '@/contracts/generated/relic-of-lies/deps/contract/game';
import * as leaderboard from '@/contracts/generated/relic-of-lies/deps/contract/leaderboard';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

// ============== Type Definitions ==============

// Type for parsed GameRoom
type GameRoomType = typeof game.GameRoom extends { $inferType: infer T } ? T : never;

// Type for parsed PlayerRecord
type PlayerRecordType = typeof leaderboard.PlayerRecord extends { $inferType: infer T } ? T : never;

// Type for parsed Leaderboard
type LeaderboardType = typeof leaderboard.Leaderboard extends { $inferType: infer T } ? T : never;

// ============== Constants ==============

// Game status constants
export const GameStatus = {
  WAITING: 0,
  PLAYING: 1,
  ROUND_END: 2,
  FINISHED: 3,
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
  [CardType.SPY]: 'Spy',
  [CardType.GUARD]: 'Guard',
  [CardType.PRIEST]: 'Priest',
  [CardType.BARON]: 'Baron',
  [CardType.HANDMAID]: 'Handmaid',
  [CardType.PRINCE]: 'Prince',
  [CardType.CHANCELLOR]: 'Chancellor',
  [CardType.KING]: 'King',
  [CardType.COUNTESS]: 'Countess',
  [CardType.PRINCESS]: 'Princess',
};

// ============== Error Code Mapping ==============

// Error codes from the smart contract
const ErrorCodes: Record<number, string> = {
  // Room Errors
  0: 'Room is full',
  1: 'Insufficient payment for entry fee',
  2: 'Room not found',
  3: 'Room name cannot be empty',
  4: 'Invalid max players (must be 2-6)',
  5: 'Already in room',
  // Game State Errors
  10: 'Game has not started yet',
  11: 'Game already started',
  12: 'Game has finished',
  13: 'Game not finished yet',
  14: 'Not enough players to start',
  15: 'Round not finished',
  16: 'Round already in progress',
  // Turn Errors
  20: 'Not your turn',
  21: 'Card not in hand',
  22: 'Invalid target player',
  23: 'Target is immune (Handmaid protection)',
  24: 'Cannot target self with this card',
  25: 'Must target self with Prince when others immune',
  26: 'Target player is eliminated',
  // Card Specific Errors
  30: 'Must discard Countess when holding King or Prince',
  31: 'Invalid guess',
  32: 'Guess is required for Guard card',
  33: 'Target is required for this card',
  34: 'Cannot guess Guard with Guard',
  // Chancellor Errors
  40: 'Must select exactly one card to keep',
  41: 'Invalid card selection for Chancellor',
  42: 'Chancellor action not pending',
  43: 'Chancellor action already pending',
  // Authorization Errors
  50: 'Not the room creator',
  51: 'Not a player in this room',
  52: 'Player is eliminated',
  // Deck Errors
  60: 'Deck is empty',
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
      const friendlyMessage = ErrorCodes[code] || `Unknown error (code: ${code})`;
      return new Error(friendlyMessage);
    }
    
    // Alternative format: "abort_code: <code>"
    const codeMatch = message.match(/abort_code[:\s]+(\d+)/i);
    if (codeMatch?.[1] !== undefined) {
      const code = parseInt(codeMatch[1], 10);
      const friendlyMessage = ErrorCodes[code] || `Unknown error (code: ${code})`;
      return new Error(friendlyMessage);
    }
    
    return error;
  }
  
  return new Error('An unknown error occurred');
}

// ============== Game Validation Functions ==============

/**
 * Validate room creation parameters
 */
export function validateCreateRoom(name: string, maxPlayers: number): string | null {
  if (!name || name.trim().length === 0) {
    return 'Room name cannot be empty';
  }
  if (name.length > 50) {
    return 'Room name must be 50 characters or less';
  }
  if (maxPlayers < 2 || maxPlayers > 6) {
    return 'Max players must be between 2 and 6';
  }
  return null;
}

/**
 * Validate if a player can join a room
 */
export function validateJoinRoom(
  room: GameRoomType | null,
  currentAddress: string | undefined
): string | null {
  if (!room) {
    return 'Room not found';
  }
  if (!currentAddress) {
    return 'Please connect your wallet first';
  }
  if (room.status !== GameStatus.WAITING) {
    return 'Game has already started';
  }
  if (room.players.length >= room.max_players) {
    return 'Room is full';
  }
  if (room.players.some(p => p.addr === currentAddress)) {
    return 'You are already in this room';
  }
  return null;
}

/**
 * Validate if a round can be started
 */
export function validateStartRound(
  room: GameRoomType | null,
  currentAddress: string | undefined
): string | null {
  if (!room) {
    return 'Room not found';
  }
  if (!currentAddress) {
    return 'Please connect your wallet first';
  }
  if (room.status !== GameStatus.WAITING && room.status !== GameStatus.ROUND_END) {
    return 'Cannot start round in current game state';
  }
  if (room.players.length < 2) {
    return 'Need at least 2 players to start';
  }
  const isCreator = room.creator === currentAddress;
  const isPlayer = room.players.some(p => p.addr === currentAddress);
  if (!isCreator && !isPlayer) {
    return 'Only room creator or players can start the round';
  }
  return null;
}

/**
 * Validate if a turn can be played
 */
export function validatePlayTurn(
  room: GameRoomType | null,
  currentAddress: string | undefined,
  card: number,
  targetIdx: number | null,
  guess: number | null
): string | null {
  if (!room) {
    return 'Room not found';
  }
  if (!currentAddress) {
    return 'Please connect your wallet first';
  }
  if (room.status !== GameStatus.PLAYING) {
    return 'Game is not in progress';
  }
  if (room.chancellor_pending) {
    return 'Chancellor action is pending';
  }

  const playerIdx = room.players.findIndex(p => p.addr === currentAddress);
  if (playerIdx === -1) {
    return 'You are not in this room';
  }

  const player = room.players[playerIdx];
  if (!player) {
    return 'Player not found';
  }
  if (!player.is_alive) {
    return 'You have been eliminated';
  }

  const currentTurnIdx = Number(room.current_turn) % room.players.length;
  if (currentTurnIdx !== playerIdx) {
    return 'It is not your turn';
  }

  // Card validation
  if (card < 0 || card > 9) {
    return 'Invalid card';
  }

  // Check if player has the card (note: player draws before playing, so check is approximate)
  // The contract will do the final validation

  // Countess rule validation
  const hasCountess = player.hand.includes(CardType.COUNTESS);
  const hasKing = player.hand.includes(CardType.KING);
  const hasPrince = player.hand.includes(CardType.PRINCE);
  if (hasCountess && (hasKing || hasPrince) && card !== CardType.COUNTESS) {
    return 'You must discard Countess when holding King or Prince';
  }

  // Card-specific validation
  const cardsNeedingTarget = [CardType.GUARD, CardType.PRIEST, CardType.BARON, CardType.KING] as number[];
  const needsTarget = cardsNeedingTarget.includes(card);
  const needsGuess = card === CardType.GUARD;

  // Check if all other players are immune or eliminated
  const validTargets = room.players.filter((p, idx) => 
    idx !== playerIdx && p.is_alive && !p.is_immune
  );
  const allOthersImmune = validTargets.length === 0;

  if (needsTarget && !allOthersImmune) {
    if (targetIdx === null || targetIdx === undefined) {
      return 'Target is required for this card';
    }
    if (targetIdx < 0 || targetIdx >= room.players.length) {
      return 'Invalid target';
    }
    if (targetIdx === playerIdx && card !== CardType.PRINCE) {
      return 'Cannot target yourself with this card';
    }
    const target = room.players[targetIdx];
    if (!target?.is_alive) {
      return 'Target player is eliminated';
    }
    if (target.is_immune) {
      return 'Target is protected by Handmaid';
    }
  }

  if (needsGuess && !allOthersImmune) {
    if (guess === null || guess === undefined) {
      return 'Guess is required for Guard';
    }
    if (guess === CardType.GUARD) {
      return 'Cannot guess Guard with Guard';
    }
    if (guess < 0 || guess > 9) {
      return 'Invalid guess';
    }
  }

  // Prince can target self
  if (card === CardType.PRINCE && targetIdx !== null) {
    if (targetIdx < 0 || targetIdx >= room.players.length) {
      return 'Invalid target';
    }
    const target = room.players[targetIdx];
    if (!target?.is_alive) {
      return 'Target player is eliminated';
    }
    if (targetIdx !== playerIdx && target.is_immune) {
      return 'Target is protected by Handmaid';
    }
  }

  return null;
}

/**
 * Validate Chancellor resolution
 */
export function validateResolveChancellor(
  room: GameRoomType | null,
  currentAddress: string | undefined,
  keepCard: number,
  returnOrder: number[]
): string | null {
  if (!room) {
    return 'Room not found';
  }
  if (!currentAddress) {
    return 'Please connect your wallet first';
  }
  if (!room.chancellor_pending) {
    return 'No Chancellor action pending';
  }

  const chancellorPlayer = room.players[Number(room.chancellor_player_idx)];
  if (chancellorPlayer?.addr !== currentAddress) {
    return 'You are not the Chancellor player';
  }

  const chancellorCards = room.chancellor_cards;
  if (!chancellorCards.includes(keepCard)) {
    return 'Invalid card selection - card not in available options';
  }

  if (returnOrder.length !== chancellorCards.length - 1) {
    return 'Must return exactly 2 cards to deck';
  }

  for (const card of returnOrder) {
    if (!chancellorCards.includes(card)) {
      return 'Invalid return card - not in available options';
    }
    if (card === keepCard) {
      return 'Cannot return the card you are keeping';
    }
  }

  return null;
}

// ============== Room Management Hooks ==============

export function useCreateRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId, roomRegistryId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const createRoom = useCallback(async (name: string, maxPlayers: number) => {
    if (!currentAccount) {
      const err = new Error('Please connect your wallet first');
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
      
      // Use app module for clean API
      tx.add(app.createRoom({
        package: movePackageId,
        arguments: {
          registry: roomRegistryId,
          name,
          maxPlayers,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      // Wait for transaction to be confirmed
      const txResponse = await client.waitForTransaction({
        digest: result.digest,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Find the created room ID from object changes
      const createdRoom = txResponse.objectChanges?.find(
        (change) => change.type === 'created' && change.objectType?.includes('::game::GameRoom')
      );

      toast.success('Room created successfully!');

      return {
        digest: result.digest,
        roomId: createdRoom && 'objectId' in createdRoom ? createdRoom.objectId : null,
      };
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      toast.error(error.message);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId, roomRegistryId]);

  return {
    createRoom,
    isPending,
    error,
  };
}

// Hook to get active rooms from the registry
export function useGetActiveRooms() {
  const client = useSuiClient();
  const { variables: { roomRegistryId } } = useNetworkConfig();
  const [rooms, setRooms] = useState<GameRoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get the RoomRegistry object to get active room IDs
      const registryData = await client.getObject({
        id: roomRegistryId,
        options: {
          showBcs: true,
        },
      });

      if (!registryData.data?.bcs || registryData.data.bcs.dataType !== 'moveObject') {
        throw new Error('Failed to fetch room registry');
      }

      const registry = game.RoomRegistry.fromBase64(registryData.data.bcs.bcsBytes);
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

      const parsedRooms: GameRoomType[] = [];
      
      for (const obj of roomObjects) {
        if (obj.data?.bcs && obj.data.bcs.dataType === 'moveObject') {
          try {
            const room = game.GameRoom.fromBase64(obj.data.bcs.bcsBytes);
            parsedRooms.push(room);
          } catch (e) {
            console.error('Failed to parse room:', e);
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
  }, [client, roomRegistryId]);

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
  const [room, setRoom] = useState<GameRoomType | null>(null);
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

      if (!roomData.data?.bcs || roomData.data.bcs.dataType !== 'moveObject') {
        throw new Error('Failed to fetch room');
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

// Hook to join a room (free entry - no payment required)
export function useJoinRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const joinRoom = useCallback(async (roomId: string, room?: GameRoomType | null) => {
    if (!currentAccount) {
      const err = new Error('Please connect your wallet first');
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
      
      // Use app module for clean API (free entry - no payment required)
      tx.add(app.joinRoom({
        package: movePackageId,
        arguments: {
          room: roomId,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true },
      });

      toast.success('Joined room successfully!');

      return { digest: result.digest };
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      toast.error(error.message);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId]);

  return {
    joinRoom,
    isPending,
    error,
  };
}

// Hook to start a round
export function useStartRound() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const startRound = useCallback(async (roomId: string, room?: GameRoomType | null) => {
    if (!currentAccount) {
      const err = new Error('Please connect your wallet first');
      toast.error(err.message);
      throw err;
    }

    // Validate if room data is provided
    if (room) {
      const validationError = validateStartRound(room, currentAccount.address);
      if (validationError) {
        const err = new Error(validationError);
        toast.error(validationError);
        throw err;
      }
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      // Use app module for clean API
      tx.add(app.startRound({
        package: movePackageId,
        arguments: {
          room: roomId,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true },
      });

      toast.success('Round started!');

      return { digest: result.digest };
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      toast.error(error.message);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId]);

  return {
    startRound,
    isPending,
    error,
  };
}

// Hook to play a turn
export function usePlayTurn() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId, leaderboardId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const playTurn = useCallback(async (
    roomId: string,
    card: number,
    targetIdx: number | null,
    guess: number | null,
    room?: GameRoomType | null
  ) => {
    if (!currentAccount) {
      const err = new Error('Please connect your wallet first');
      toast.error(err.message);
      throw err;
    }

    // Validate if room data is provided
    if (room) {
      const validationError = validatePlayTurn(room, currentAccount.address, card, targetIdx, guess);
      if (validationError) {
        const err = new Error(validationError);
        toast.error(validationError);
        throw err;
      }
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      // Use app module for clean API
      tx.add(app.playTurn({
        package: movePackageId,
        arguments: {
          room: roomId,
          leaderboard: leaderboardId,
          card,
          targetIdx,
          guess,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true },
      });

      const cardName = CardNames[card] || 'Card';
      toast.success(`Played ${cardName}!`);

      return { digest: result.digest };
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      toast.error(error.message);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId, leaderboardId]);

  return {
    playTurn,
    isPending,
    error,
  };
}

// Hook to resolve chancellor action
export function useResolveChancellor() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId, leaderboardId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const resolveChancellor = useCallback(async (
    roomId: string,
    keepCard: number,
    returnOrder: number[],
    room?: GameRoomType | null
  ) => {
    if (!currentAccount) {
      const err = new Error('Please connect your wallet first');
      toast.error(err.message);
      throw err;
    }

    // Validate if room data is provided
    if (room) {
      const validationError = validateResolveChancellor(room, currentAccount.address, keepCard, returnOrder);
      if (validationError) {
        const err = new Error(validationError);
        toast.error(validationError);
        throw err;
      }
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      // Use app module for clean API
      tx.add(app.resolveChancellor({
        package: movePackageId,
        arguments: {
          room: roomId,
          leaderboard: leaderboardId,
          keepCard,
          returnOrder,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true },
      });

      const cardName = CardNames[keepCard] || 'Card';
      toast.success(`Kept ${cardName} and returned cards to deck`);

      return { digest: result.digest };
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      toast.error(error.message);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId, leaderboardId]);

  return {
    resolveChancellor,
    isPending,
    error,
  };
}

// Hook to cleanup a finished room
export function useCleanupRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId, roomRegistryId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const cleanupRoom = useCallback(async (roomId: string, room?: GameRoomType | null) => {
    if (!currentAccount) {
      const err = new Error('Please connect your wallet first');
      toast.error(err.message);
      throw err;
    }

    // Validate if room data is provided
    if (room && room.status !== GameStatus.FINISHED) {
      const err = new Error('Room is not finished yet');
      toast.error(err.message);
      throw err;
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      tx.add(app.cleanupRoom({
        package: movePackageId,
        arguments: {
          registry: roomRegistryId,
          room: roomId,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true },
      });

      toast.success('Room cleaned up successfully');

      return { digest: result.digest };
    } catch (err) {
      const error = parseContractError(err);
      setError(error);
      toast.error(error.message);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId, roomRegistryId]);

  return {
    cleanupRoom,
    isPending,
    error,
  };
}

// ============== Leaderboard Hooks ==============

// Hook to get leaderboard data
export function useGetLeaderboard() {
  const client = useSuiClient();
  const { variables: { leaderboardId } } = useNetworkConfig();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await client.getObject({
        id: leaderboardId,
        options: {
          showBcs: true,
        },
      });

      if (!data.data?.bcs || data.data.bcs.dataType !== 'moveObject') {
        throw new Error('Failed to fetch leaderboard');
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
  }, [client, leaderboardId]);

  return {
    leaderboard: leaderboardData,
    fetchLeaderboard,
    isLoading,
    error,
  };
}

// Hook to get top players
export function useGetTopPlayers(count: number = 10) {
  const { leaderboard: leaderboardData, fetchLeaderboard, isLoading, error } = useGetLeaderboard();
  
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
export function useIsPlayerInRoom(room: GameRoomType | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return false;
  
  return room.players.some(player => player.addr === currentAccount.address);
}

// Hook to get current player's index in room
export function usePlayerIndex(room: GameRoomType | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount) return -1;
  
  return room.players.findIndex(player => player.addr === currentAccount.address);
}

// Hook to check if it's current player's turn
export function useIsMyTurn(room: GameRoomType | null) {
  const currentAccount = useCurrentAccount();
  
  if (!room || !currentAccount || room.status !== GameStatus.PLAYING) return false;
  
  const currentTurnIdx = Number(room.current_turn) % room.players.length;
  const currentPlayer = room.players[currentTurnIdx];
  
  return currentPlayer?.addr === currentAccount.address;
}

// Hook to get current player's hand
export function useMyHand(room: GameRoomType | null) {
  const playerIdx = usePlayerIndex(room);
  
  if (!room || playerIdx === -1) return [];
  
  return room.players[playerIdx]?.hand ?? [];
}

// Hook to check if current player is alive
export function useIsAlive(room: GameRoomType | null) {
  const playerIdx = usePlayerIndex(room);
  
  if (!room || playerIdx === -1) return false;
  
  return room.players[playerIdx]?.is_alive ?? false;
}

// Export the types for use in components
export type { GameRoomType, PlayerRecordType, LeaderboardType };
