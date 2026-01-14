'use client';

import { useSuiClient, useSuiClientContext, useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useCallback, useState } from 'react';
import * as game from '@/contracts/generated/relic-of-lies/deps/contract/game';
import { useNetworkConfig } from '@/app/(root)/_components/sui-provider';

// Type for parsed GameRoom
type GameRoomType = typeof game.GameRoom extends { $inferType: infer T } ? T : never;

export function useCreateRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId, roomRegistryId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const createRoom = useCallback(async (name: string, maxPlayers: number) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first');
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      tx.add(game.createRoom({
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

      return {
        digest: result.digest,
        roomId: createdRoom && 'objectId' in createdRoom ? createdRoom.objectId : null,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create room');
      setError(error);
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
      const error = err instanceof Error ? err : new Error('Failed to fetch rooms');
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
      const error = err instanceof Error ? err : new Error('Failed to fetch room');
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

// Entry fee constant (0.1 SUI = 100_000_000 MIST)
const ENTRY_FEE = 100_000_000n;

// Hook to join a room
export function useJoinRoom() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { variables: { movePackageId } } = useNetworkConfig();
  const [error, setError] = useState<Error | null>(null);

  const joinRoom = useCallback(async (roomId: string) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first');
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      // Split coin for entry fee
      const [paymentCoin] = tx.splitCoins(tx.gas, [ENTRY_FEE]);
      
      tx.add(game.joinRoom({
        package: movePackageId,
        arguments: {
          room: roomId,
          payment: paymentCoin,
        },
      }));

      const result = await signAndExecute({
        transaction: tx,
      });

      await client.waitForTransaction({
        digest: result.digest,
        options: { showEffects: true },
      });

      return { digest: result.digest };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to join room');
      setError(error);
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

  const startRound = useCallback(async (roomId: string) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first');
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      tx.add(game.startRound({
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

      return { digest: result.digest };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start round');
      setError(error);
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
    guess: number | null
  ) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first');
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      tx.add(game.playTurn({
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

      return { digest: result.digest };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to play turn');
      setError(error);
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
    returnOrder: number[]
  ) => {
    if (!currentAccount) {
      throw new Error('Please connect your wallet first');
    }

    setError(null);

    try {
      const tx = new Transaction();
      
      tx.add(game.resolveChancellor({
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

      return { digest: result.digest };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to resolve chancellor');
      setError(error);
      throw error;
    }
  }, [client, currentAccount, signAndExecute, movePackageId, leaderboardId]);

  return {
    resolveChancellor,
    isPending,
    error,
  };
}

// Export the type for use in components
export type { GameRoomType };
