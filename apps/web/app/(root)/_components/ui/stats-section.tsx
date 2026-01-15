"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Gamepad2, TrendingUp } from "lucide-react";

const stats = [
	{
		icon: Users,
		label: "Active Players",
		value: "1,234",
		change: "+12%",
		trend: "up",
	},
	{
		icon: Gamepad2,
		label: "Games Played",
		value: "5,678",
		change: "+8%",
		trend: "up",
	},
	{
		icon: Trophy,
		label: "Total Prize Pool",
		value: "1,234 SUI",
		change: "+25%",
		trend: "up",
	},
	{
		icon: TrendingUp,
		label: "Win Rate",
		value: "42%",
		change: "+3%",
		trend: "up",
	},
];

export function StatsSection() {
	return (
		<section className="py-20 px-4 bg-black">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
						Game Statistics
					</h2>
					<p className="text-lg text-zinc-400">
						Real-time stats from the Relic of Lies community
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{stats.map((stat, index) => {
						const Icon = stat.icon;
						return (
							<Card
								key={index}
								className="border-zinc-800 bg-zinc-900/50 hover:border-blue-600/50 transition-all duration-300"
							>
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center">
											<Icon className="w-6 h-6 text-blue-400" />
										</div>
										<span className={`text-sm font-medium ${
											stat.trend === "up" ? "text-green-400" : "text-red-400"
										}`}>
											{stat.change}
										</span>
									</div>
									<div className="space-y-1">
										<p className="text-3xl font-bold text-white">{stat.value}</p>
										<p className="text-sm text-zinc-400">{stat.label}</p>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>
		</section>
	);
}
