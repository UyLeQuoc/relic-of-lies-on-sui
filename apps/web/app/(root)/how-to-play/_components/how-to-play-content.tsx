'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Coins, Trophy, Target, Shield } from "lucide-react";
import { CardCharacter } from "@/components/common/game-ui/cards/card-character";
import { CardType } from "@/components/common/game-ui/cards/types";

const cardEffects = [
	{ name: 'Scout', value: 0, count: 2, cardType: CardType.Value0, effect: 'At round end, if only you played or discarded a Scout, gain 1 Relic.' },
	{ name: 'Knight', value: 1, count: 6, cardType: CardType.Value1, effect: 'Name a non-Knight card. If that target holds it, they are eliminated.' },
	{ name: 'Healer', value: 2, count: 2, cardType: CardType.Value2, effect: 'Choose and privately look at another player\'s hand.' },
	{ name: 'Berserker', value: 3, count: 2, cardType: CardType.Value3, effect: 'Compare hands with another player. Lower card is eliminated.' },
	{ name: 'Cleric', value: 4, count: 2, cardType: CardType.Value4, effect: 'You are immune to all card effects until your next turn.' },
	{ name: 'Wizard', value: 5, count: 2, cardType: CardType.Value5, effect: 'Choose any player. They discard their card and draw a new one.' },
	{ name: 'Tactician', value: 6, count: 2, cardType: CardType.Value6, effect: 'Draw 2 cards. Keep one and place the others at bottom in any order.' },
	{ name: 'Paladin', value: 7, count: 1, cardType: CardType.Value7, effect: 'Choose and swap your hand with another player\'s hand.' },
	{ name: 'Cursed Idol', value: 8, count: 1, cardType: CardType.Value8, effect: 'Must be discarded if held with Wizard or Paladin. Otherwise, no effect.' },
	{ name: 'Sacred Crystal', value: 9, count: 1, cardType: CardType.Value9, effect: 'If you play or discard this card, you are immediately eliminated.' },
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
							Relic Of Lies is a game of risk, deduction, and luck. The goal is to be the last player standing or hold the highest-value card when the deck runs out.
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
									<p className="font-medium">3 Relics</p>
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
									<p className="font-medium">Win Relics</p>
									<p className="text-sm text-muted-foreground">Survive the round to earn Relics. First to 3 Relics wins the prize pool!</p>
								</div>
							</li>
						</ol>
					</CardContent>
				</Card>

				{/* Card Effects */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Card Effects</CardTitle>
						<CardDescription>21 cards total, 10 different types</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{cardEffects.map((card) => (
								<div key={card.name} className="p-4 rounded-lg border bg-card">
									<div className="flex items-start gap-4 mb-3">
										{/* Card Image */}
										<div className="flex-shrink-0">
											<CardCharacter cardType={card.cardType} size="xs" />
										</div>
										{/* Card Info */}
										<div className="flex-1">
											<h3 className="font-semibold text-lg mb-2">{card.name}</h3>
											<div className="flex items-center gap-2 mb-2">
												<Badge variant="outline">Value: {card.value}</Badge>
												<Badge variant="secondary">Count: {card.count}</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{card.effect}</p>
										</div>
									</div>
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
								Cursed Idol Rule
							</h3>
							<p className="text-sm text-muted-foreground">
								If you have Cursed Idol AND (Wizard OR Paladin) in hand, you MUST play Cursed Idol.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Scout Bonus</h3>
							<p className="text-sm text-muted-foreground">
								At end of round, check all players who played or hold Scout. If EXACTLY ONE player qualifies, they get +1 Relic. If multiple players have Scout, no bonus is awarded.
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

				{/* Relic System */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="w-5 h-5" />
							Relic System
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2">
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span><strong>Round Win:</strong> +1 Relic</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span><strong>Scout Bonus:</strong> +1 Relic (if ONLY you played/hold Scout)</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-primary">•</span>
								<span><strong>Game Win:</strong> First to collect 3 Relics wins the prize pool</span>
							</li>
						</ul>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
