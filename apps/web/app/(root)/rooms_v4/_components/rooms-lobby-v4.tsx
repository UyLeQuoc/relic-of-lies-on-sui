"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateRoomV4,
  useGetActiveRoomsV4,
  useJoinRoomV4,
  type GameRoomV4Type,
} from "@/hooks/use-game-contract-v4";
import { RefreshCw, Search, Users, Lock, Shield } from "lucide-react";
import LoginComponent from "@/components/common/login";
import { CreateRoomV4 } from "./create-room-v4";

type StatusFilter = "all" | "0" | "1" | "2" | "3";

export function RoomsLobbyV4() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [playerCountFilter, setPlayerCountFilter] = useState<string>("all");

  const {
    createRoom,
    isPending: isCreating,
    error: createError,
  } = useCreateRoomV4();
  const {
    rooms,
    fetchRooms,
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useGetActiveRoomsV4();
  const { joinRoom, isPending: isJoining } = useJoinRoomV4();

  // Fetch rooms on mount and periodically
  useEffect(() => {
    if (currentAccount) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 5000);
      return () => clearInterval(interval);
    }
  }, [currentAccount, fetchRooms]);

  const handleCreateRoom = async (name: string, maxPlayers: number) => {
    try {
      const result = await createRoom(name, maxPlayers);
      fetchRooms();
      
      if (result.roomId) {
        // Automatically join the room after creating it
        try {
          await joinRoom(result.roomId);
          // Wait a bit for the join transaction to be processed
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (joinErr) {
          console.error("Failed to auto-join room:", joinErr);
          // Continue anyway - user can manually join
        }
        
        router.push(`/game_v4?roomId=${result.roomId}`);
      }
    } catch (err) {
      console.error("Failed to create room:", err);
      // Error is already handled by the hook
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Waiting";
      case 1:
        return "Playing";
      case 2:
        return "Round End";
      case 3:
        return "Finished";
      default:
        return "Unknown";
    }
  };

  const getStatusVariant = (
    status: number
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 0:
        return "secondary";
      case 1:
        return "default";
      case 2:
        return "outline";
      case 3:
        return "destructive";
      default:
        return "outline";
    }
  };

  const isPlayerInRoom = (room: GameRoomV4Type) => {
    return room.players.some((p) => p.addr === currentAccount?.address);
  };

  const handleJoinRoom = async (roomId: string) => {
    setJoiningRoomId(roomId);
    try {
      await joinRoom(roomId);
      router.push(`/game_v4?roomId=${roomId}`);
    } catch (err) {
      console.error("Failed to join room:", err);
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleEnterRoom = (roomId: string) => {
    router.push(`/game_v4?roomId=${roomId}`);
  };

  // Filter rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (
        searchQuery &&
        !room.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (statusFilter !== "all" && room.status.toString() !== statusFilter) {
        return false;
      }

      if (playerCountFilter !== "all") {
        const [min, max] = playerCountFilter.split("-").map(Number);
        if (min === undefined) {
          return false;
        }
        if (max) {
          if (room.players.length < min || room.players.length > max) {
            return false;
          }
        } else {
          if (room.players.length !== min) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rooms, searchQuery, statusFilter, playerCountFilter]);

  // Error handling - removed toast notification
  // Rooms error will be handled by UI state instead
  useEffect(() => {
    if (!currentAccount) return;
    if (roomsError?.message) {
      console.error("Rooms error:", roomsError.message);
    }
  }, [roomsError, currentAccount]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              Game Rooms (V4)
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Seal Encrypted
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Join a room or create your own. Cards are encrypted with Seal for
              privacy.
            </p>
          </div>
        </div>

        {/* Login Section */}
        {!currentAccount && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to view and join rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginComponent />
            </CardContent>
          </Card>
        )}

        {currentAccount && (
          <>
            {/* Filters and Search */}
            <div className="mb-6 p-0 bg-transparent border-none shadow-none flex items-center justify-between">
              <div className="w-1/2">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search rooms by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-96 pl-9"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(val) =>
                      setStatusFilter(val as StatusFilter)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="0">Waiting</SelectItem>
                      <SelectItem value="1">Playing</SelectItem>
                      <SelectItem value="2">Round End</SelectItem>
                      <SelectItem value="3">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={playerCountFilter}
                    onValueChange={setPlayerCountFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Players" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Players</SelectItem>
                      <SelectItem value="0-1">0-1 Players</SelectItem>
                      <SelectItem value="2">2 Players</SelectItem>
                      <SelectItem value="3">3 Players</SelectItem>
                      <SelectItem value="4">4 Players</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size={"icon"}
                    variant="outline"
                    onClick={() => fetchRooms()}
                    disabled={isLoadingRooms}
                  >
                    <RefreshCw
                      className={`${isLoadingRooms ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
              <CreateRoomV4
                onCreateRoom={handleCreateRoom}
                isCreating={isCreating}
                error={createError}
              />
            </div>

            {/* Rooms Grid */}
            {isLoadingRooms && rooms.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading rooms...</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredRooms.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {rooms.length === 0
                        ? "No active rooms found. Create a room to get started!"
                        : "No rooms match your filters. Try adjusting your search criteria."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.map((room) => {
                  const inRoom = isPlayerInRoom(room);
                  const canJoin =
                    room.status === 0 &&
                    room.players.length < room.max_players &&
                    !inRoom;
                  const isJoiningThis = joiningRoomId === room.id.id;
                  const isFull = room.players.length >= room.max_players;
                  const hasDeck = room.encrypted_cards.length > 0;

                  return (
                    <Card key={room.id.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {room.name}
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </CardTitle>
                          <Badge variant={getStatusVariant(room.status)}>
                            {getStatusText(room.status)}
                          </Badge>
                        </div>
                        <CardDescription>
                          Round {room.round_number} • Created by{" "}
                          {room.creator.slice(0, 6)}...{room.creator.slice(-4)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>
                            {room.players.length}/{room.max_players} Players
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4" />
                          <span>
                            {hasDeck
                              ? `${room.deck_indices.length} cards in deck`
                              : "Deck not submitted"}
                          </span>
                        </div>
                        {inRoom && (
                          <Badge variant="secondary" className="w-fit">
                            You're in this room
                          </Badge>
                        )}
                        {room.pending_action && (
                          <Badge variant="destructive" className="w-fit">
                            Pending Action
                          </Badge>
                        )}
                      </CardContent>
                      <CardFooter>
                        {inRoom ? (
                          <Button
                            className="w-full"
                            onClick={() => handleEnterRoom(room.id.id)}
                          >
                            Enter Room
                          </Button>
                        ) : canJoin ? (
                          <Button
                            className="w-full"
                            onClick={() => handleJoinRoom(room.id.id)}
                            disabled={isJoining || isJoiningThis}
                          >
                            {isJoiningThis ? "Joining..." : "Join (Free)"}
                          </Button>
                        ) : (
                          <Button className="w-full" variant="outline" disabled>
                            {isFull
                              ? "Full"
                              : room.status !== 0
                                ? "In Progress"
                                : "Cannot Join"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
