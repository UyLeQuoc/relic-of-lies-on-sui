"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Coins, Users, Trophy, Zap, Lock } from "lucide-react";

const features = [
	{
		icon: Shield,
		title: "On-Chain Security",
		description: "Fully decentralized gameplay on Sui blockchain. Your cards, your wins, your rewards - all secured by smart contracts.",
	},
	{
		icon: Coins,
		title: "Stake & Win",
		description: "Entry fee of 0.1 SUI per game. Winner takes the entire prize pool. Play strategically to maximize your rewards.",
	},
	{
		icon: Users,
		title: "2-4 Players",
		description: "Play with friends or join public rooms. Support for 2-4 players with balanced gameplay mechanics.",
	},
	{
		icon: Trophy,
		title: "Global Leaderboard",
		description: "Compete for the top spot. Track your wins, games played, and ranking against players worldwide.",
	},
	{
		icon: Zap,
		title: "10 Unique Cards",
		description: "Relic Of Lies  with 21 cards total. Master Spy, Chancellor, and all card effects.",
	},
	{
		icon: Lock,
		title: "Token System",
		description: "Win rounds to collect tokens. First to 3 tokens wins the game. Spy bonus adds strategic depth.",
	},
];

export function FeaturesSection() {
	return (
		<section className="py-20 px-4 bg-black">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-4">
						<span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
							Game Features
						</span>
					</h2>
					<p className="text-lg text-zinc-400 max-w-2xl mx-auto">
						Experience the ultimate Relic Of Lies card game on blockchain. Strategy, luck, and skill combine in every match.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<Card
								key={index}
								className="border-zinc-800 bg-zinc-900/50 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
							>
								<CardHeader>
									<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center mb-4">
										<Icon className="w-6 h-6 text-blue-400" />
									</div>
									<CardTitle className="text-xl text-white">{feature.title}</CardTitle>
									<CardDescription className="text-base mt-2 text-zinc-400">
										{feature.description}
									</CardDescription>
								</CardHeader>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
