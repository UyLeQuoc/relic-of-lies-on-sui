"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, BookOpen } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
	return (
		<section className="py-20 px-4 bg-gradient-to-b from-black to-zinc-950">
			<div className="max-w-4xl mx-auto">
				<Card className="border-blue-600/30 bg-gradient-to-br from-zinc-900 to-zinc-950">
					<CardContent className="p-12 text-center">
						<h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
							Ready to Play?
						</h2>
						<p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
							Join thousands of players competing for the top spot. Create a room, invite friends, and start your journey to become the ultimate Love Letter champion.
						</p>
						
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
							<Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white min-w-[200px] border-0">
								<Link href="/rooms" className="flex items-center gap-2">
									<Gamepad2 className="w-5 h-5" />
									Start Playing
								</Link>
							</Button>
							<Button asChild size="lg" variant="outline" className="min-w-[200px] border-2 border-zinc-700 text-white hover:bg-zinc-900 hover:border-zinc-600">
								<Link href="/how-to-play" className="flex items-center gap-2">
									<BookOpen className="w-5 h-5" />
									Learn How to Play
								</Link>
							</Button>
						</div>

						<div className="mt-12 pt-8 border-t border-zinc-800">
							<div className="flex flex-wrap justify-center gap-8 text-sm text-zinc-400">
								<div>
									<span className="font-semibold text-white">Entry Fee:</span> 0.1 SUI
								</div>
								<div>
									<span className="font-semibold text-white">Players:</span> 2-4 per room
								</div>
								<div>
									<span className="font-semibold text-white">Cards:</span> 21 (10 types)
								</div>
								<div>
									<span className="font-semibold text-white">Win Condition:</span> 3 tokens
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
