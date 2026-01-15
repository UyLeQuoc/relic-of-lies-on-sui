"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, Trophy, Coins } from "lucide-react";
import Link from "next/link";

const steps = [
	{
		number: "01",
		icon: Gamepad2,
		title: "Create or Join Room",
		description: "Create your own game room or join an existing one. Set player limits (2-4 players) and wait for others to join.",
	},
	{
		number: "02",
		icon: Users,
		title: "Start the Round",
		description: "Once enough players join, start the round. Cards are shuffled and dealt. Each player gets 1 card to start.",
	},
	{
		number: "03",
		icon: Trophy,
		title: "Play Strategically",
		description: "Take turns playing cards. Use Guard to guess, Priest to peek, Baron to compare, and more. Be the last one standing!",
	},
	{
		number: "04",
		icon: Coins,
		title: "Win Tokens & Prize",
		description: "Win rounds to collect tokens. First to 3 tokens wins the entire prize pool. Spy bonus can give extra tokens!",
	},
];

export function HowItWorksSection() {
	return (
		<section className="py-20 px-4 bg-zinc-950">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
						How It Works
					</h2>
					<p className="text-lg text-zinc-400 max-w-2xl mx-auto">
						Get started in minutes. Simple setup, strategic gameplay, instant rewards.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{steps.map((step, index) => {
						const Icon = step.icon;
						return (
							<Card
								key={index}
								className="relative border-zinc-800 bg-zinc-900/50 hover:border-blue-600/50 transition-all duration-300 overflow-hidden"
							>
								<div className="absolute top-0 right-0 text-6xl font-bold text-zinc-800 leading-none">
									{step.number}
								</div>
								<CardHeader className="relative z-10">
									<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center mb-4">
										<Icon className="w-6 h-6 text-blue-400" />
									</div>
									<CardTitle className="text-xl mb-2 text-white">{step.title}</CardTitle>
								</CardHeader>
								<CardContent className="relative z-10">
									<p className="text-zinc-400">{step.description}</p>
								</CardContent>
							</Card>
						);
					})}
				</div>

				<div className="text-center">
					<Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0">
						<Link href="/how-to-play">
							Learn More About Game Rules
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
