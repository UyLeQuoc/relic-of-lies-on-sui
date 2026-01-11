"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, Shield, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { GameCardComponent } from "./game-card";
import { GameCard, useGame } from "./game-context";

export function PlayersZone() {
	const { players, currentPlayerIndex, gamePhase, isBotThinking } = useGame();

	if (gamePhase === "setup") return null;

	return (
		<div className="w-full px-2 py-4" data-tour="players-zone">
			<div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
				{players.map((player, index) => {
					const isActivePlayer =
						index === currentPlayerIndex && !player.isEliminated;
					const isThinking = isActivePlayer && player.isBot && isBotThinking;

					return (
						<motion.div
							key={player.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className={cn(
								"relative flex flex-col items-center p-3 md:p-4 rounded-2xl transition-all duration-300 min-w-[120px] md:min-w-[140px]",
								isActivePlayer &&
									"ring-2 ring-gold dark:ring-silver shadow-lg shadow-gold/20 dark:shadow-silver/20",
								player.isEliminated && "opacity-60",
							)}
						>
							{/* Active player glow */}
							{isActivePlayer && (
								<motion.div
									className="absolute inset-0 rounded-2xl bg-gold/10 dark:bg-silver/10"
									animate={{ opacity: [0.5, 1, 0.5] }}
									transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
								/>
							)}

							{/* Eliminated overlay */}
							<AnimatePresence>
								{player.isEliminated && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="absolute inset-0 rounded-2xl bg-black/40 dark:bg-black/60 flex items-center justify-center z-20"
									>
										<motion.div
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											className="flex flex-col items-center gap-1"
										>
											<Skull className="w-8 h-8 text-red-500" />
											<span className="text-xs text-red-400 font-medium">
												Eliminated
											</span>
										</motion.div>
									</motion.div>
								)}
							</AnimatePresence>

							{/* Victorian Avatar Frame */}
							<div className="relative">
								<motion.div
									animate={isActivePlayer ? { scale: [1, 1.05, 1] } : {}}
									transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
									className={cn(
										"w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-3 shadow-lg",
										isActivePlayer
											? "border-gold dark:border-silver"
											: "border-cream dark:border-midnight-light",
									)}
								>
									<img
										src={player.avatar || "/placeholder.svg"}
										alt={player.name}
										className="w-full h-full object-cover"
									/>
								</motion.div>

								{/* Protection shield */}
								<AnimatePresence>
									{player.isProtected && !player.isEliminated && (
										<motion.div
											initial={{ scale: 0, rotate: -180 }}
											animate={{ scale: 1, rotate: 0 }}
											exit={{ scale: 0, rotate: 180 }}
											className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-cream shadow-md"
										>
											<Shield className="w-3 h-3 text-white" />
										</motion.div>
									)}
								</AnimatePresence>

								{/* Current player indicator (You) */}
								{!player.isBot && (
									<motion.div
										animate={{ scale: [1, 1.1, 1] }}
										transition={{
											repeat: Number.POSITIVE_INFINITY,
											duration: 2,
										}}
										className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gold dark:bg-silver rounded-full shadow-md"
									>
										<span className="text-[10px] font-bold text-crimson-dark dark:text-midnight">
											YOU
										</span>
									</motion.div>
								)}

								<AnimatePresence>
									{isThinking && (
										<motion.div
											initial={{ opacity: 0, y: 5 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -5 }}
											className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 rounded-full flex items-center gap-1 shadow-md"
										>
											<motion.div
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Number.POSITIVE_INFINITY,
													ease: "linear",
												}}
											>
												<Brain className="w-3 h-3 text-white" />
											</motion.div>
											<span className="text-[10px] font-bold text-white">
												Thinking
											</span>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Player name */}
							<h3
								className={cn(
									"mt-2 font-medium text-sm truncate max-w-[100px]",
									isActivePlayer
										? "text-gold dark:text-silver"
										: "text-crimson-dark dark:text-silver-light",
								)}
							>
								{player.name}
							</h3>

							{/* Heart tokens with animation */}
							<div className="flex gap-0.5 mt-1">
								{Array.from({ length: player.hearts }).map((_, i) => (
									<motion.span
										key={`filled-${i}`}
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ delay: i * 0.1, type: "spring" }}
										className="text-pink-light text-sm"
									>
										♥
									</motion.span>
								))}
								{Array.from({ length: 4 - player.hearts }).map((_, i) => (
									<span
										key={`empty-${i}`}
										className="text-muted-foreground/30 text-sm"
									>
										♥
									</span>
								))}
							</div>

							{/* Player's card */}
							<div className="mt-3">
								{!player.isBot ? null : player.isEliminated &&
									player.discardedCards.length > 0 ? (
									<motion.div
										initial={{ rotateY: 180 }}
										animate={{ rotateY: 0 }}
										transition={{ type: "spring" }}
									>
										<GameCardComponent
											card={player.discardedCards[player.discardedCards.length - 1] as GameCard}
											size="small"
											faceUp
											disabled
										/>
									</motion.div>
								) : player.hand[0] ? (
									<motion.div
										animate={isThinking ? { rotateY: [0, 10, -10, 0] } : {}}
										transition={{
											duration: 0.5,
											repeat: isThinking ? Number.POSITIVE_INFINITY : 0,
										}}
									>
										<GameCardComponent
											card={player.hand[0]}
											size="small"
											faceUp={false}
											disabled
										/>
									</motion.div>
								) : null}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
