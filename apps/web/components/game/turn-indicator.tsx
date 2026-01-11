"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crown, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useGame } from "./game-context";

// Reduced duration and simplified animations to avoid overlap with notifications
export function TurnIndicator() {
	const { players, currentPlayerIndex, gamePhase, isProcessingAction } =
		useGame();
	const [showIndicator, setShowIndicator] = useState(false);

	const currentPlayer = players[currentPlayerIndex];
	const isYourTurn = currentPlayer && !currentPlayer.isBot;

	useEffect(() => {
		// Only show if we are in playing phase and not currently processing an effect/reveal
		if (gamePhase === "playing" && !isProcessingAction && currentPlayer) {
			setShowIndicator(true);
			const timer = setTimeout(() => setShowIndicator(false), 2000);
			return () => clearTimeout(timer);
		} else {
			setShowIndicator(false);
		}
	}, [currentPlayerIndex, gamePhase, isProcessingAction, currentPlayer]);

	return (
		<AnimatePresence mode="wait">
			{showIndicator && currentPlayer && (
				<motion.div
					key={`turn-${currentPlayerIndex}`}
					initial={{ opacity: 0, scale: 0.3, y: 100 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.5, y: -50 }}
					transition={{ type: "spring", stiffness: 250, damping: 20 }}
					className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none"
				>
					<motion.div
						animate={{
							boxShadow: isYourTurn
								? [
										"0 0 40px rgba(220, 38, 38, 0.3)",
										"0 0 70px rgba(220, 38, 38, 0.5)",
										"0 0 40px rgba(220, 38, 38, 0.3)",
									]
								: [
										"0 0 40px rgba(212, 175, 55, 0.3)",
										"0 0 70px rgba(212, 175, 55, 0.5)",
										"0 0 40px rgba(212, 175, 55, 0.3)",
									],
						}}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						className={`px-8 py-5 rounded-2xl bg-gradient-to-r ${
							isYourTurn
								? "from-crimson via-rose-600 to-crimson dark:from-crimson-dark dark:via-rose-700 dark:to-crimson-dark"
								: "from-amber-600 via-gold to-amber-600 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700"
						} text-white shadow-2xl border-3 border-white/40 backdrop-blur-sm`}
					>
						<div className="flex items-center gap-5">
							<motion.div
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
								className="w-14 h-14 rounded-full overflow-hidden border-3 border-white/60 flex-shrink-0 shadow-lg"
							>
								<img
									src={currentPlayer.avatar || "/placeholder.svg"}
									alt={currentPlayer.name}
									className="w-full h-full object-cover"
								/>
							</motion.div>

							<div>
								<motion.div
									initial={{ opacity: 0, y: -5 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="flex items-center gap-2 mb-1"
								>
									{isYourTurn ? (
										<Crown className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
									) : (
										<Wand2 className="w-5 h-5 text-yellow-300 drop-shadow-lg" />
									)}
									<span className="uppercase tracking-wider text-xs font-bold text-white/90">
										{isYourTurn ? "Your Turn" : "Opponent Turn"}
									</span>
								</motion.div>
								<motion.h3
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.15 }}
									className="font-serif text-2xl font-bold text-white drop-shadow-lg"
								>
									{isYourTurn ? "Make Your Move" : currentPlayer.name}
								</motion.h3>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
