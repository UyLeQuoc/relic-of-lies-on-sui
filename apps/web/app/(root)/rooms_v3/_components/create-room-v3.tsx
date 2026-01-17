'use client';

import { useState } from 'react';
import { Plus, Lock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface CreateRoomV3Props {
	onCreateRoom: (name: string, maxPlayers: number) => Promise<void>;
	isCreating: boolean;
	error?: Error | null;
}

export function CreateRoomV3({ onCreateRoom, isCreating, error }: CreateRoomV3Props) {
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
				<Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
					<Plus className="w-4 h-4 mr-2" />
					Create Sealed Room
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Lock className="w-5 h-5 text-violet-500" />
						Create Sealed Game Room
					</DialogTitle>
					<DialogDescription>
						Create a new game room with encrypted cards. Only you can see your cards until revealed.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<Badge variant="outline" className="w-fit border-violet-500 text-violet-500">
						<Lock className="w-3 h-3 mr-1" />
						Seal Encrypted
					</Badge>
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
						className="bg-gradient-to-r from-violet-600 to-purple-600"
					>
						{isCreating ? 'Creating...' : 'Create Room'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
