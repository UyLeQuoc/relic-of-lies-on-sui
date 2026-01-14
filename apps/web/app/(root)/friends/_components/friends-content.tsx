'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Search, UserMinus, MessageCircle, Gamepad2 } from "lucide-react";
import { useCurrentAccount } from '@mysten/dapp-kit';

// Mock data - replace with real data from contracts/hooks
const mockFriends = [
	{ address: '0x1234...5678', status: 'online', wins: 5, games: 12 },
	{ address: '0xabcd...efgh', status: 'offline', wins: 8, games: 15 },
	{ address: '0x9876...4321', status: 'in-game', wins: 3, games: 10 },
];

const mockFriendRequests = [
	{ address: '0x1111...2222', sentAt: '2 hours ago' },
	{ address: '0x3333...4444', sentAt: '1 day ago' },
];

export function FriendsContent() {
	const currentAccount = useCurrentAccount();
	const [searchQuery, setSearchQuery] = useState('');

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
								<Users className="w-10 h-10 text-primary" />
								Friends
							</h1>
							<p className="text-muted-foreground">
								Connect with players and challenge them to matches
							</p>
						</div>
						<Button>
							<UserPlus className="w-4 h-4 mr-2" />
							Add Friend
						</Button>
					</div>
				</div>

				{/* Search */}
				<Card className="mb-6">
					<CardContent className="pt-6">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search friends by address..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Friend Requests */}
				{mockFriendRequests.length > 0 && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle>Friend Requests</CardTitle>
							<CardDescription>Pending friend requests</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{mockFriendRequests.map((request) => (
									<div key={request.address} className="flex items-center justify-between p-3 rounded-lg border bg-card">
										<div>
											<p className="font-medium">{request.address}</p>
											<p className="text-sm text-muted-foreground">Sent {request.sentAt}</p>
										</div>
										<div className="flex gap-2">
											<Button size="sm">Accept</Button>
											<Button size="sm" variant="outline">Decline</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Friends List */}
				<Card>
					<CardHeader>
						<CardTitle>Your Friends ({mockFriends.length})</CardTitle>
						<CardDescription>Manage your friends list</CardDescription>
					</CardHeader>
					<CardContent>
						{mockFriends.length === 0 ? (
							<div className="text-center py-12">
								<Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
								<p className="text-muted-foreground mb-4">No friends yet</p>
								<Button>
									<UserPlus className="w-4 h-4 mr-2" />
									Add Your First Friend
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								{mockFriends.map((friend) => (
									<div key={friend.address} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
										<div className="flex items-center gap-4 flex-1">
											<div className="relative">
												<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
													<Users className="w-6 h-6 text-primary" />
												</div>
												<div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
													friend.status === 'online' ? 'bg-green-500' : 
													friend.status === 'in-game' ? 'bg-yellow-500' : 
													'bg-gray-500'
												}`} />
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<p className="font-medium">{friend.address}</p>
													<Badge variant={friend.status === 'online' ? 'default' : friend.status === 'in-game' ? 'secondary' : 'outline'}>
														{friend.status === 'in-game' ? 'In Game' : friend.status}
													</Badge>
												</div>
												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													<span>{friend.wins} Wins</span>
													<span>{friend.games} Games</span>
													<span>{Math.round((friend.wins / friend.games) * 100)}% Win Rate</span>
												</div>
											</div>
										</div>
										<div className="flex gap-2">
											{friend.status === 'online' && (
												<Button size="sm" variant="outline">
													<Gamepad2 className="w-4 h-4 mr-2" />
													Challenge
												</Button>
											)}
											<Button size="sm" variant="outline">
												<MessageCircle className="w-4 h-4 mr-2" />
												Message
											</Button>
											<Button size="sm" variant="ghost">
												<UserMinus className="w-4 h-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
