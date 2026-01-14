'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scroll, Trophy, Coins, Target, CheckCircle2, Circle } from "lucide-react";
import { useCurrentAccount } from '@mysten/dapp-kit';

// Mock data - replace with real data from contracts
const mockQuests = [
	{
		id: 1,
		title: 'First Victory',
		description: 'Win your first game',
		reward: '10 SUI',
		progress: 1,
		target: 1,
		status: 'completed',
		type: 'achievement',
	},
	{
		id: 2,
		title: 'Win Streak',
		description: 'Win 3 games in a row',
		reward: '50 SUI',
		progress: 2,
		target: 3,
		status: 'in-progress',
		type: 'achievement',
	},
	{
		id: 3,
		title: 'Card Master',
		description: 'Play 100 cards total',
		reward: '25 SUI',
		progress: 67,
		target: 100,
		status: 'in-progress',
		type: 'progressive',
	},
	{
		id: 4,
		title: 'Social Player',
		description: 'Play 10 games with friends',
		reward: '30 SUI',
		progress: 4,
		target: 10,
		status: 'in-progress',
		type: 'progressive',
	},
	{
		id: 5,
		title: 'Champion',
		description: 'Reach top 10 in leaderboard',
		reward: '100 SUI',
		progress: 0,
		target: 1,
		status: 'locked',
		type: 'achievement',
	},
];

export function QuestsContent() {
	const currentAccount = useCurrentAccount();

	const getProgressPercentage = (progress: number, target: number) => {
		return Math.min((progress / target) * 100, 100);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<Scroll className="w-12 h-12 mx-auto mb-4 text-primary" />
					<h1 className="text-4xl font-bold mb-2">Quests</h1>
					<p className="text-muted-foreground text-lg">
						Complete quests to earn rewards and climb the leaderboard
					</p>
				</div>

				{/* Stats Summary */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<Trophy className="w-8 h-8 text-primary" />
								<div>
									<p className="text-2xl font-bold">2</p>
									<p className="text-sm text-muted-foreground">Completed</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<Target className="w-8 h-8 text-primary" />
								<div>
									<p className="text-2xl font-bold">3</p>
									<p className="text-sm text-muted-foreground">In Progress</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-center gap-3">
								<Coins className="w-8 h-8 text-primary" />
								<div>
									<p className="text-2xl font-bold">215</p>
									<p className="text-sm text-muted-foreground">Total Rewards (SUI)</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Quests List */}
				<div className="space-y-4">
					{mockQuests.map((quest) => {
						const progressPercent = getProgressPercentage(quest.progress, quest.target);
						const isCompleted = quest.status === 'completed';
						const isLocked = quest.status === 'locked';

						return (
							<Card key={quest.id} className={isLocked ? 'opacity-60' : ''}>
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<CardTitle>{quest.title}</CardTitle>
												{isCompleted && (
													<Badge variant="default">
														<CheckCircle2 className="w-3 h-3 mr-1" />
														Completed
													</Badge>
												)}
												{isLocked && (
													<Badge variant="outline">Locked</Badge>
												)}
												{!isCompleted && !isLocked && (
													<Badge variant="secondary">In Progress</Badge>
												)}
											</div>
											<CardDescription>{quest.description}</CardDescription>
										</div>
										<div className="text-right">
											<p className="text-lg font-bold text-primary flex items-center gap-1">
												<Coins className="w-4 h-4" />
												{quest.reward}
											</p>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<div className="flex justify-between text-sm mb-1">
												<span className="text-muted-foreground">Progress</span>
												<span className="font-medium">
													{quest.progress} / {quest.target}
												</span>
											</div>
											<div className="w-full bg-muted rounded-full h-2">
												<div
													className="bg-primary h-2 rounded-full transition-all"
													style={{ width: `${progressPercent}%` }}
												/>
											</div>
										</div>
										{isCompleted && (
											<Button className="w-full" disabled>
												<CheckCircle2 className="w-4 h-4 mr-2" />
												Claimed
											</Button>
										)}
										{isLocked && (
											<Button className="w-full" variant="outline" disabled>
												<Circle className="w-4 h-4 mr-2" />
												Locked
											</Button>
										)}
										{!isCompleted && !isLocked && (
											<Button className="w-full" disabled={quest.progress < quest.target}>
												{quest.progress >= quest.target ? 'Claim Reward' : 'In Progress'}
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}
