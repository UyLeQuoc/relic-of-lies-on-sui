"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Brain,
	ChevronDown,
	ChevronUp,
	Heart,
	HelpCircle,
	Loader2,
	Sparkles,
	Target,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { GameCardComponent } from "./game-card";
import { type CardType, useGame } from "./game-context";

const guessableCards: { type: CardType; name: string }[] = [
	{ type: "spy", name: "Scout (0)" },
	{ type: "priest", name: "Healer (2)" },
	{ type: "baron", name: "Berserker (3)" },
	{ type: "handmaid", name: "Cleric (4)" },
	{ type: "prince", name: "Wizard (5)" },
	{ type: "chancellor", name: "Tactician (6)" },
	{ type: "king", name: "Paladin (7)" },
	{ type: "countess", name: "Cursed Idol (8)" },
	{ type: "princess", name: "Sacred Crystal (9)" },
];

export function PlayerHUD() {
	const {
		players,
		selectedCard,
		selectedTarget,
		selectedGuess,
		setSelectedCard,
		setSelectedTarget,
		setSelectedGuess,
		playCard,
		gamePhase,
		currentPlayerIndex,
		isBotThinking,
		isProcessingAction,
	} = useGame();
	const [isExpanded, setIsExpanded] = useState(true);

	const currentPlayer = players[currentPlayerIndex];
	const humanPlayer = players.find((p) => !p.isBot);
	const currentPlayerHand = humanPlayer?.hand || [];

	const isMyTurn =
		currentPlayer &&
		!currentPlayer.isBot &&
		gamePhase === "playing" &&
		!isProcessingAction;
	const isBotTurn = currentPlayer?.isBot && gamePhase === "playing";

	const eligibleTargets = players.filter((p) => {
		if (p.isEliminated) return false;
		if (p.isProtected) return false;
		if (selectedCard?.type === "prince") return true;
		return p.id !== humanPlayer?.id;
	});

	const needsTarget =
		selectedCard &&
		!["handmaid", "countess", "princess", "spy", "chancellor"].includes(
			selectedCard.type,
		);
	const needsGuess = selectedCard?.type === "guard";

	const hasCountess = currentPlayerHand.some((c) => c.type === "countess");
	const hasKingOrPrince = currentPlayerHand.some(
		(c) => c.type === "king" || c.type === "prince",
	);
	const mustPlayCountess = hasCountess && hasKingOrPrince;

	const canPlay =
		isMyTurn &&
		selectedCard &&
		(!needsTarget || selectedTarget || eligibleTargets.length === 0) &&
		(!needsGuess || selectedGuess);

	if (gamePhase === "setup") return null;

	return (
		<motion.div
			className="fixed bottom-0 left-0 right-0 z-40"
			initial={{ y: 100 }}
			animate={{ y: 0 }}
			data-tour="player-hud"
		>
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="absolute -top-8 left-1/2 -translate-x-1/2 bg-crimson-dark/90 dark:bg-midnight-deep/90 backdrop-blur-sm text-cream dark:text-silver px-4 py-1 rounded-t-lg border-t border-x border-gold/30 dark:border-silver/30"
			>
				{isExpanded ? (
					<ChevronDown className="w-5 h-5" />
				) : (
					<ChevronUp className="w-5 h-5" />
				)}
			</button>

			<AnimatePresence>
				{isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="bg-crimson-dark/95 dark:bg-midnight-deep/95 backdrop-blur-md border-t-2 border-gold dark:border-silver"
					>
						<div className="container mx-auto px-4 py-4">
							{isBotTurn || isProcessingAction ? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="flex flex-col items-center justify-center gap-3 py-6"
								>
									<div className="flex items-center gap-3">
										<div className="relative">
											<motion.div
												className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold dark:border-silver"
												animate={{ scale: isBotThinking ? [1, 1.05, 1] : 1 }}
												transition={{
													duration: 1,
													repeat: Number.POSITIVE_INFINITY,
												}}
											>
												<img
													src={currentPlayer?.avatar || "/placeholder.svg"}
													alt={currentPlayer?.name}
													className="w-full h-full object-cover"
												/>
											</motion.div>
											{isBotThinking && (
												<motion.div
													className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
													animate={{ scale: [1, 1.2, 1] }}
													transition={{
														duration: 0.5,
														repeat: Number.POSITIVE_INFINITY,
													}}
												>
													<Brain className="w-3 h-3 text-white" />
												</motion.div>
											)}
										</div>
										<div className="text-left">
											<p className="text-cream dark:text-silver font-medium">
												{currentPlayer?.name}
											</p>
											<div className="flex items-center gap-2 text-gold dark:text-silver-light text-sm">
												{isBotThinking ? (
													<>
														<Loader2 className="w-4 h-4 animate-spin" />
														<span>is pondering their next move...</span>
													</>
												) : isProcessingAction ? (
													<>
														<Sparkles className="w-4 h-4 animate-pulse" />
														<span>Action in progress...</span>
													</>
												) : (
													<>
														<Sparkles className="w-4 h-4" />
														<span>is playing their card...</span>
													</>
												)}
											</div>
										</div>
									</div>

									{isBotThinking && (
										<div className="flex gap-1 mt-2">
											{[0, 1, 2].map((i) => (
												<motion.div
													key={i}
													className="w-2 h-2 bg-gold dark:bg-silver rounded-full"
													animate={{ y: [0, -8, 0] }}
													transition={{
														duration: 0.6,
														repeat: Number.POSITIVE_INFINITY,
														delay: i * 0.15,
													}}
												/>
											))}
										</div>
									)}

									{currentPlayerHand.length > 0 && (
										<div className="flex gap-3 mt-4 opacity-60">
											{currentPlayerHand.map((card) => (
												<GameCardComponent
													key={card.id}
													card={card}
													size="medium"
													faceUp
													disabled
												/>
											))}
										</div>
									)}
								</motion.div>
							) : (
								<div className="flex flex-col md:flex-row items-center justify-between gap-4">
									<div className="flex flex-col items-center gap-2">
										<div className="flex items-center gap-4 mb-1">
											<h3 className="text-sm font-medium text-gold dark:text-silver uppercase tracking-wider">
												Your Hand
											</h3>
											<div className="flex gap-1 bg-black/20 px-2 py-1 rounded-full border border-gold/20">
												{Array.from({ length: humanPlayer?.hearts || 0 }).map(
													(_, i) => (
														<Heart
															key={i}
															className="w-4 h-4 text-pink-light fill-pink-light"
														/>
													),
												)}
											</div>
											{mustPlayCountess && (
												<motion.span
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="text-xs text-pink-light font-bold"
												>
													MUST PLAY CURSED IDOL!
												</motion.span>
											)}
										</div>
										<div className="flex gap-4">
											{currentPlayerHand.map((card, index) => {
												const isDisabled =
													mustPlayCountess && card.type !== "countess";
												return (
													<motion.div
														key={card.id}
														initial={{ opacity: 0, y: 20, rotateY: 180 }}
														animate={{ opacity: 1, y: 0, rotateY: 0 }}
														transition={{
															delay: index * 0.1,
															type: "spring",
															stiffness: 100,
															damping: 12,
														}}
														whileHover={{ y: -10, scale: 1.02 }}
														className="relative"
													>
														<GameCardComponent
															card={card}
															size="large"
															faceUp
															selected={selectedCard?.id === card.id}
															disabled={isDisabled || !isMyTurn}
															onClick={() => {
																if (isDisabled || !isMyTurn) return;
																setSelectedCard(
																	selectedCard?.id === card.id ? null : card,
																);
																setSelectedTarget(null);
																setSelectedGuess(null);
															}}
														/>
														<AnimatePresence>
															{selectedCard?.id === card.id && (
																<motion.div
																	initial={{ opacity: 0, scale: 0.8 }}
																	animate={{ opacity: 1, scale: 1 }}
																	exit={{ opacity: 0, scale: 0.8 }}
																	className="absolute inset-0 rounded-lg bg-gold/30 dark:bg-silver/30 -z-10 blur-lg"
																/>
															)}
														</AnimatePresence>
													</motion.div>
												);
											})}
										</div>
									</div>

									<AnimatePresence>
										{selectedCard && isMyTurn && (
											<motion.div
												initial={{ opacity: 0, x: 20, scale: 0.95 }}
												animate={{ opacity: 1, x: 0, scale: 1 }}
												exit={{ opacity: 0, x: 20, scale: 0.95 }}
												className="flex flex-col gap-3 bg-cream/10 dark:bg-midnight/30 rounded-xl p-4 min-w-[280px] border border-gold/20 dark:border-silver/20"
											>
												<div className="flex items-center gap-2 text-gold dark:text-silver">
													<HelpCircle className="w-4 h-4" />
													<span className="text-sm font-medium">
														{selectedCard.description}
													</span>
												</div>

												{needsTarget && eligibleTargets.length > 0 && (
													<div className="flex flex-col gap-2">
														<label className="text-xs text-cream/80 dark:text-silver-light/80 flex items-center gap-1">
															<Target className="w-3 h-3" />
															Select Target
														</label>
														<Select
															value={selectedTarget?.id}
															onValueChange={(value) => {
																const target = players.find(
																	(p) => p.id === value,
																);
																setSelectedTarget(target || null);
															}}
														>
															<SelectTrigger className="bg-cream/20 dark:bg-midnight/50 border-gold/30 dark:border-silver/30 text-cream dark:text-silver">
																<SelectValue placeholder="Choose a player..." />
															</SelectTrigger>
															<SelectContent>
																{eligibleTargets.map((player) => (
																	<SelectItem key={player.id} value={player.id}>
																		<div className="flex items-center gap-2">
																			<img
																				src={
																					player.avatar || "/placeholder.svg"
																				}
																				alt=""
																				className="w-6 h-6 rounded-full"
																			/>
																			<span>{player.name}</span>
																		</div>
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												)}

												{needsTarget && eligibleTargets.length === 0 && (
													<motion.div
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														className="text-sm text-amber-400 bg-amber-400/10 rounded-lg p-2 border border-amber-400/20"
													>
														No valid targets available. Card will be discarded
														with no effect.
													</motion.div>
												)}

												{needsGuess && eligibleTargets.length > 0 && (
													<div className="flex flex-col gap-2">
														<label className="text-xs text-cream/80 dark:text-silver-light/80">
															Guess opponent's card (cannot guess Knight)
														</label>
														<Select
															value={selectedGuess || undefined}
															onValueChange={(value) =>
																setSelectedGuess(value as CardType)
															}
														>
															<SelectTrigger className="bg-cream/20 dark:bg-midnight/50 border-gold/30 dark:border-silver/30 text-cream dark:text-silver">
																<SelectValue placeholder="Choose a card..." />
															</SelectTrigger>
															<SelectContent>
																{guessableCards
																	.filter((c) => c.type !== "guard")
																	.map((card) => (
																		<SelectItem
																			key={card.type}
																			value={card.type}
																		>
																			{card.name}
																		</SelectItem>
																	))}
															</SelectContent>
														</Select>
													</div>
												)}

												<Button
													onClick={playCard}
													disabled={!canPlay}
													className={cn(
														"w-full font-bold text-lg py-6 transition-all duration-200 relative overflow-hidden",
														canPlay
															? "bg-gradient-to-r from-crimson to-crimson-dark hover:from-crimson-dark hover:to-crimson text-cream shadow-lg hover:shadow-xl"
															: "bg-muted text-muted-foreground",
													)}
												>
													{canPlay && (
														<motion.div
															className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
															animate={{ x: ["-100%", "100%"] }}
															transition={{
																duration: 1.5,
																repeat: Number.POSITIVE_INFINITY,
																repeatDelay: 0.5,
															}}
														/>
													)}
													<span className="relative">
														Play {selectedCard.name}
													</span>
												</Button>
											</motion.div>
										)}
									</AnimatePresence>

									{!isMyTurn && !isBotTurn && !isProcessingAction && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="text-gold/70 dark:text-silver/70 text-center py-4"
										>
											Waiting for your turn...
										</motion.div>
									)}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
