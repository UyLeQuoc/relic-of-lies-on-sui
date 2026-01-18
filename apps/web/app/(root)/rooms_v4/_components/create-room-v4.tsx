"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CreateRoomV4Props {
  onCreateRoom: (name: string, maxPlayers: number) => Promise<void>;
  isCreating: boolean;
  error: Error | null;
}

export function CreateRoomV4({
  onCreateRoom,
  isCreating,
  error,
}: CreateRoomV4Props) {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("4");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateRoom(roomName, parseInt(maxPlayers, 10));
      setOpen(false);
      setRoomName("");
      setMaxPlayers("4");
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Room (V4)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Create New Room
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Seal Encrypted
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Create a new game room with Seal encryption. Card values are hidden
              from other players and verified on-chain.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Room Name</Label>
              <Input
                id="name"
                placeholder="Enter room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPlayers">Max Players</Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger id="maxPlayers">
                  <SelectValue placeholder="Select max players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="3">3 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                  <SelectItem value="5">5 Players</SelectItem>
                  <SelectItem value="6">6 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !roomName.trim()}>
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
