'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface CreateRoomProps {
	onCreateRoom: (name: string, maxPlayers: number) => Promise<void>;
	isCreating: boolean;
	error?: Error | null;
}

export function CreateRoom({ onCreateRoom, isCreating, error }: CreateRoomProps) {
	const [open, setOpen] = useState(false);
	const [roomName, setRoomName] = useState('');
	const [maxPlayers, setMaxPlayers] = useState(4);

	const handleSubmit = async () => {
		if (!roomName.trim()) return;

		try {
			await onCreateRoom(roomName, maxPlayers);
			setRoomName('');
			setMaxPlayers(4);
			setOpen(false);
		} catch (err) {
			console.error('Failed to create room:', err);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="w-4 h-4 mr-2" />
					Create Room
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Plus className="w-5 h-5" />
						Create New Room
					</DialogTitle>
					<DialogDescription>
						Create a new game room for players to join. Set your room name and maximum players.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="room-name">Room Name</Label>
						<Input
							id="room-name"
							placeholder="Enter room name..."
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="max-players">Max Players</Label>
						<Select
							value={maxPlayers.toString()}
							onValueChange={(val) => setMaxPlayers(Number(val))}
						>
							<SelectTrigger id="max-players">
								<SelectValue placeholder="Select max players" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="2">2 Players</SelectItem>
								<SelectItem value="3">3 Players</SelectItem>
								<SelectItem value="4">4 Players</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{error && (
						<p className="text-sm text-destructive">{error.message}</p>
					)}
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isCreating}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isCreating || !roomName.trim()}
					>
						{isCreating ? 'Creating...' : 'Create Room'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
