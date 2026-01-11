"use client";

import { motion } from "framer-motion";
import { BookOpen, Map as MapIcon, Skull, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "./game-context";

interface StartScreenProps {
	onOpenRules: () => void;
	onOpenCardTutorial: () => void;
	onStartGuideTour: () => void;
}

export function StartScreen({
	onOpenRules,
	onOpenCardTutorial,
	onStartGuideTour,
}: StartScreenProps) {
	const { startGame } = useGame();
	const [isHovering, setIsHovering] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-b from-obsidian via-obsidian-deep to-obsidian-deeper flex items-center justify-center relative overflow-hidden">
			{/* Animated mystical orbs background */}
			<div className="absolute inset-0 overflow-hidden opacity-30">
				{Array.from({ length: 8 }).map((_, i) => {
					const id = `orb-${i}`;
					return (
						<motion.div
							key={id}
							className="absolute rounded-full mix-blend-screen"
							style={{
								width: Math.random() * 300 + 100,
								height: Math.random() * 300 + 100,
								background: `radial-gradient(circle, ${
									[
										"rgba(139, 92, 246, 0.3)",
										"rgba(59, 130, 246, 0.3)",
										"rgba(168, 85, 247, 0.3)",
									][Math.floor(Math.random() * 3)]
								}, transparent)`,
							}}
							animate={{
								x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
								y: [Math.random() * 200 - 100, Math.random() * 200 - 100],
							}}
							transition={{
								duration: 20 + Math.random() * 10,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
						/>
					);
				})}
			</div>

			{/* Skull icon accent */}
			<motion.div
				className="absolute top-10 right-10 opacity-20"
				animate={{ rotate: 360 }}
				transition={{
					duration: 30,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
				}}
			>
				<Skull className="w-16 h-16 text-violet-600" />
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center z-10 px-4"
			>
				{/* Logo */}
				<motion.div
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
					className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 border-2 border-violet-400 flex items-center justify-center shadow-2xl shadow-violet-500/50 relative"
				>
					<motion.div
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
					>
						<Wand2 className="w-12 h-12 text-white" />
					</motion.div>
				</motion.div>

				<motion.h1
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="font-serif text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 mb-2"
				>
					Relic of Lies
				</motion.h1>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="text-violet-300/80 text-lg mb-12 max-w-md mx-auto"
				>
					A 1v1 fantasy dungeon card game. Outwit your opponent in this mystical
					battle of secrets and deception.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className="flex flex-col gap-4 mb-8 w-full max-w-md"
				>
					<Button
						onClick={() => startGame(1)}
						onMouseEnter={() => setIsHovering(true)}
						onMouseLeave={() => setIsHovering(false)}
						className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white text-lg px-12 py-7 rounded-lg shadow-lg shadow-violet-500/50 hover:shadow-violet-600/60 transition-all w-full"
					>
						<motion.div
							animate={{ scale: isHovering ? 1.1 : 1 }}
							transition={{ duration: 0.2 }}
						>
							<Wand2 className="w-5 h-5 mr-3 inline" />
						</motion.div>
						Start Game vs Bot
					</Button>

					<Button
						onClick={onOpenRules}
						className="border-2 border-violet-500 text-violet-300 hover:bg-violet-500/10 bg-transparent text-lg px-12 py-7 rounded-lg w-full"
					>
						<BookOpen className="w-5 h-5 mr-2" />
						How to Play
					</Button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1.0 }}
					className="flex flex-col sm:flex-row gap-3 justify-center"
				>
					<Button
						onClick={onOpenCardTutorial}
						variant="ghost"
						className="text-violet-300 hover:text-violet-200 hover:bg-violet-500/20"
					>
						Card Reference Guide
					</Button>

					<Button
						onClick={onStartGuideTour}
						variant="ghost"
						className="text-violet-300 hover:text-violet-200 hover:bg-violet-500/20"
					>
						<MapIcon className="w-4 h-4 mr-2" />
						UI Tour
					</Button>
				</motion.div>
			</motion.div>
		</div>
	);
}
