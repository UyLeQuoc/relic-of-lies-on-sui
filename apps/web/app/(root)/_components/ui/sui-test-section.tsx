'use client';

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import LoginComponent from '@/components/common/login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRoom, useGetActiveRooms } from '@/hooks/use-game-contract';

export default function SuiTestSection() {
  const currentAccount = useCurrentAccount();
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  
  const { createRoom, isPending: isCreating, error: createError } = useCreateRoom();
  const { rooms, fetchRooms, isLoading: isLoadingRooms, error: roomsError } = useGetActiveRooms();

  // Fetch account balance
  const { data: balance, refetch: refetchBalance } = useSuiClientQuery(
    'getBalance',
    { owner: currentAccount?.address ?? '' },
    { enabled: !!currentAccount }
  );

  // Fetch rooms on mount and when account changes
  useEffect(() => {
    if (currentAccount) {
      fetchRooms();
    }
  }, [currentAccount, fetchRooms]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    try {
      const result = await createRoom(roomName, maxPlayers);
      console.log('Room created:', result);
      alert(`Room created successfully! Digest: ${result.digest}`);
      setRoomName('');
      // Refresh rooms list
      fetchRooms();
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  // Room status mapping
  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Waiting';
      case 1: return 'Playing';
      case 2: return 'Round End';
      case 3: return 'Finished';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <div className="text-2xl font-bold">Sui Testnet</div>
        <div className="text-lg text-muted-foreground">
          Test your Sui wallet connection and test the Sui testnet.
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Wallet</h2>
        <LoginComponent />
        {currentAccount && balance && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Balance:</span>
            <span className="font-medium">
              {(Number(balance.totalBalance) / 1_000_000_000).toFixed(3)} SUI
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2"
              onClick={() => refetchBalance()}
            >
              ↻
            </Button>
          </div>
        )}
      </div>

      {currentAccount && (
        <>
          {/* Create Room Section */}
          <div className="space-y-3 rounded-lg border p-4">
            <h2 className="text-xl font-semibold">Create Room</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Max Players"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min={2}
                max={6}
                className="w-32"
              />
              <Button 
                onClick={handleCreateRoom} 
                disabled={isCreating || !roomName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </Button>
            </div>
            {createError && (
              <p className="text-sm text-red-500">{createError.message}</p>
            )}
          </div>

          {/* Active Rooms Section */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Rooms</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchRooms()}
                disabled={isLoadingRooms}
              >
                {isLoadingRooms ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            {roomsError && (
              <p className="text-sm text-red-500">{roomsError.message}</p>
            )}

            {rooms.length === 0 ? (
              <p className="text-muted-foreground">No active rooms found</p>
            ) : (
              <div className="space-y-2">
                {rooms.map((room) => (
                  <div 
                    key={room.id.id} 
                    className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                  >
                    <div>
                      <p className="font-medium">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Players: {room.players.length}/{room.max_players} • 
                        Status: {getStatusText(room.status)} • 
                        Round: {room.round_number}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Pot: {(Number(room.pot.value) / 1_000_000_000).toFixed(3)} SUI</p>
                      <p className="text-muted-foreground">
                        Tokens to win: {room.tokens_to_win}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
