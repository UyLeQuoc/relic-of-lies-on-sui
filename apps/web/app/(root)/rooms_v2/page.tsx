'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  useCreateRoom,
  useGetActiveRooms,
  useJoinRoom,
  GameStatus,
  type ZKGameRoomType,
} from '@/hooks/use-game-contract-v2';

export default function RoomsV2Page() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { rooms, fetchRooms, isLoading, error } = useGetActiveRooms();
  const { createRoom, isPending: isCreating } = useCreateRoom();
  const { joinRoom, isPending: isJoining } = useJoinRoom();

  // Form state
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch rooms on mount and periodically
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  // Handle create room
  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setActionError('Room name is required');
      return;
    }

    setActionError(null);
    try {
      const result = await createRoom(roomName, maxPlayers);
      if (result.roomId) {
        router.push(`/game_v2?roomId=${result.roomId}`);
      } else {
        fetchRooms();
        setShowCreateForm(false);
        setRoomName('');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  // Handle join room
  const handleJoinRoom = async (roomId: string, room: ZKGameRoomType) => {
    setActionError(null);
    try {
      await joinRoom(roomId, room);
      router.push(`/game_v2?roomId=${roomId}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  // Handle enter room (already joined)
  const handleEnterRoom = (roomId: string) => {
    router.push(`/game_v2?roomId=${roomId}`);
  };

  // Check if current user is in room
  const isInRoom = useCallback((room: ZKGameRoomType) => {
    if (!currentAccount) return false;
    return room.players.some(p => p.addr === currentAccount.address);
  }, [currentAccount]);

  // Get status text
  const getStatusText = (status: number): string => {
    const statusMap: Record<number, string> = {
      [GameStatus.WAITING]: 'Waiting',
      [GameStatus.PLAYING]: 'Playing',
      [GameStatus.ROUND_END]: 'Round End',
      [GameStatus.FINISHED]: 'Finished',
      [GameStatus.PENDING_PROOF]: 'Pending',
    };
    return statusMap[status] || 'Unknown';
  };

  // Get status color
  const getStatusColor = (status: number): string => {
    const colorMap: Record<number, string> = {
      [GameStatus.WAITING]: 'text-green-400',
      [GameStatus.PLAYING]: 'text-amber-400',
      [GameStatus.ROUND_END]: 'text-blue-400',
      [GameStatus.FINISHED]: 'text-slate-400',
      [GameStatus.PENDING_PROOF]: 'text-purple-400',
    };
    return colorMap[status] || 'text-slate-400';
  };

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-400">Wallet Not Connected</h1>
          <p className="text-slate-400 mt-2">Please connect your wallet to view rooms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-400">Game Rooms (ZK v2)</h1>
            <p className="text-slate-400 mt-1">Zero-Knowledge Proof Version</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            {showCreateForm ? 'Cancel' : 'Create Room'}
          </Button>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400">{actionError}</p>
          </div>
        )}

        {/* Create Room Form */}
        {showCreateForm && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Create New Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Room Name</label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Max Players (2-6)</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setMaxPlayers(num)}
                      className={cn(
                        "px-4 py-2 rounded border transition-all",
                        maxPlayers === num
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : 'border-slate-600 hover:border-slate-400 text-slate-300'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating || !roomName.trim()}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && rooms.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto" />
            <p className="mt-4 text-slate-400">Loading rooms...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400">{error.message}</p>
            <Button onClick={fetchRooms} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && rooms.length === 0 && (
          <div className="bg-slate-800 rounded-lg p-12 text-center">
            <p className="text-slate-400 text-lg">No active rooms</p>
            <p className="text-slate-500 mt-2">Create a room to start playing!</p>
          </div>
        )}

        {/* Rooms List */}
        {rooms.length > 0 && (
          <div className="space-y-4">
            {rooms.map((room) => {
              const roomId = room.id.id;
              const inRoom = isInRoom(room);
              const canJoin = room.status === GameStatus.WAITING && !inRoom && room.players.length < room.max_players;

              return (
                <div
                  key={roomId}
                  className={cn(
                    "bg-slate-800 rounded-lg p-4 border transition-all",
                    inRoom ? 'border-amber-500/50' : 'border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-amber-300">{room.name}</h3>
                        <span className={cn("text-sm", getStatusColor(room.status))}>
                          {getStatusText(room.status)}
                        </span>
                        {inRoom && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                            Joined
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span>Players: {room.players.length}/{room.max_players}</span>
                        <span>Round: {room.round_number}</span>
                        <span>Deck: {Number(room.deck_size)}</span>
                      </div>
                      {/* Player addresses */}
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {room.players.map((player, idx) => (
                          <span
                            key={player.addr}
                            className={cn(
                              "text-xs px-2 py-0.5 rounded",
                              player.addr === currentAccount.address
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-700 text-slate-400'
                            )}
                          >
                            {player.addr === currentAccount.address ? 'You' : `P${idx + 1}`}
                            {!player.is_alive && ' ☠️'}
                            {player.is_immune && ' 🛡️'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {canJoin && (
                        <Button
                          onClick={() => handleJoinRoom(roomId, room)}
                          disabled={isJoining}
                          size="sm"
                        >
                          {isJoining ? 'Joining...' : 'Join'}
                        </Button>
                      )}
                      {inRoom && (
                        <Button
                          onClick={() => handleEnterRoom(roomId)}
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                          Enter
                        </Button>
                      )}
                      {!canJoin && !inRoom && room.status !== GameStatus.FINISHED && (
                        <Button
                          onClick={() => handleEnterRoom(roomId)}
                          size="sm"
                          variant="outline"
                        >
                          Spectate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <Button onClick={fetchRooms} variant="outline" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Rooms'}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-amber-400 font-semibold mb-2">About ZK Version</h3>
          <p className="text-slate-400 text-sm">
            This is the Zero-Knowledge Proof version of Love Letter. Cards are hidden using 
            cryptographic commitments and verified using ZK proofs. This ensures that no one 
            (not even the blockchain) can see your cards until you reveal them.
          </p>
          <ul className="mt-2 text-slate-500 text-sm list-disc list-inside">
            <li>Cards are stored as commitments (hash of card + salt)</li>
            <li>Card effects are verified using ZK proofs</li>
            <li>The dealer distributes cards off-chain</li>
            <li>Timeout mechanism for unresponsive players</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
