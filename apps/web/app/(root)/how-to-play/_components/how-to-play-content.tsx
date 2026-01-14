'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Coins, Trophy, Target, Shield } from "lucide-react";

const cardEffects = [
	{ name: 'Spy', value: 0, count: 2, effect: 'No immediate effect. At round end, if you\'re the ONLY player who played/holds Spy, gain +1 token' },
	{ name: 'Guard', value: 1, count: 6, effect: 'Guess a player\'s card (not Guard). If correct, they\'re eliminated' },
	{ name: 'Priest', value: 2, count: 2, effect: 'Look at another player\'s hand' },
	{ name: 'Baron', value: 3, count: 2, effect: 'Compare hands with a player. Lower value is eliminated' },
	{ name: 'Handmaid', value: 4, count: 2, effect: 'Immune to targeting until your next turn' },
	{ name: 'Prince', value: 5, count: 2, effect: 'Choose any player to discard and draw. If Princess discarded, eliminated' },
	{ name: 'Chancellor', value: 6, count: 2, effect: 'Draw 2 cards, keep 1, return 2 to bottom of deck' },
	{ name: 'King', value: 7, count: 1, effect: 'Trade hands with another player' },
	{ name: 'Countess', value: 8, count: 1, effect: 'Must be discarded if you have King or Prince' },
	{ name: 'Princess', value: 9, count: 1, effect: 'If discarded (by you or forced), you are eliminated' },
];

export function HowToPlayContent() {
	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-5xl">
				{/* Header */}
				<div className="mb-8 text-center">
					<BookOpen className="w-12 h-12 mx-auto mb-4 text-primary" />
					<h1 className="text-4xl font-bold mb-2">How to Play</h1>
					<p className="text-muted-foreground text-lg">
						Master the art of deception and deduction in Relic of Lies
					</p>
				</div>

				{/* Game Overview */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="w-5 h-5" />
							Game Overview
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-muted-foreground">
							Love Letter is a game of risk, deduction, and luck. The goal is to be the last player standing or hold the highest-value card when the deck runs out.
						</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
								<Users className="w-5 h-5 text-primary" />
								<div>
									<p className="font-medium">2-4 Players</p>
									<p className="text-sm text-muted-foreground">Per room</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
								<Coins className="w-5 h-5 text-primary" />
								<div>
									<p className="font-medium">0.1 SUI</p>
									<p className="text-sm text-muted-foreground">Entry fee</p>
								</div>
							</div>
							<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
								<Trophy className="w-5 h-5 text-primary" />
								<div>
									<p className="font-medium">3 Tokens</p>
									<p className="text-sm text-muted-foreground">To win</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Game Flow */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Game Flow</CardTitle>
					</CardHeader>
					<CardContent>
						<ol className="space-y-4">
							<li className="flex gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
								<div>
									<p className="font-medium">Create or Join a Room</p>
									<p className="text-sm text-muted-foreground">Create your own room or join an existing one. Pay 0.1 SUI entry fee.</p>
								</div>
							</li>
							<li className="flex gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
								<div>
									<p className="font-medium">Start a Round</p>
									<p className="text-sm text-muted-foreground">Once enough players join, the creator or any player can start the round.</p>
								</div>
							</li>
							<li className="flex gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
								<div>
									<p className="font-medium">Play Your Turn</p>
									<p className="text-sm text-muted-foreground">On your turn, play a card from your hand and execute its effect.</p>
								</div>
							</li>
							<li className="flex gap-4">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
								<div>
									<p className="font-medium">Win Tokens</p>
									<p className="text-sm text-muted-foreground">Survive the round to earn tokens. First to 3 tokens wins the prize pool!</p>
								</div>
							</li>
						</ol>
					</CardContent>
				</Card>

				{/* Card Effects */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Card Effects (2019 Premium Edition)</CardTitle>
						<CardDescription>21 cards total, 10 different types</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{cardEffects.map((card) => (
								<div key={card.name} className="p-4 rounded-lg border bg-card">
									<div className="flex items-start justify-between mb-2">
										<div>
											<h3 className="font-semibold text-lg">{card.name}</h3>
											<div className="flex items-center gap-2 mt-1">
												<Badge variant="outline">Value: {card.value}</Badge>
												<Badge variant="secondary">Count: {card.count}</Badge>
											</div>
										</div>
									</div>
									<p className="text-sm text-muted-foreground mt-2">{card.effect}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Special Rules */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Special Rules</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-semibold mb-2 flex items-center gap-2">
								<Shield className="w-4 h-4" />
								Countess Rule
							</h3>
							<p className="text-sm text-muted-foreground">
								If you have Countess AND (King OR Prince) in hand, you MUST play Countess.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Spy Bonus</h3>
							<p className="text-sm text-muted-foreground">
								At end of round, check all players who played or hold Spy. If EXACTLY ONE player qualifies, they get +1 token. If multiple players have Spy, no bonus is awarded.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">2-Player Game</h3>
							<p className="text-sm text-muted-foreground">
								3 cards are revealed face-up at start (public information) to help balance the game with more information.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Tiebreaker</h3>
							<p className="text-sm text-muted-foreground">
								When deck is empty and multiple players are alive: Compare hand card values (highest wins). If tied, compare sum of discarded cards (highest wins).
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Token System */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="w-5 h-5" />
							Token System
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span><strong>Round Win:</strong> +1 token</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span><strong>Spy Bonus:</strong> +1 token (if ONLY you played/hold Spy)</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span><strong>Game Win:</strong> First to collect 3 tokens wins the prize pool</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
