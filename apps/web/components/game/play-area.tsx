"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Eye, Layers } from "lucide-react";
import { GameCardComponent } from "./game-card";
import { useGame } from "./game-context";

export function PlayArea() {
	const {
		deckCount,
		discardPile,
		removedCards,
		gamePhase,
		setShowDiscardPile,
	} = useGame();

	if (gamePhase === "setup") return null;

	return (
		<div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
			<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
				{/* Draw Deck */}
				<motion.div
					data-tour="deck-area"
					className="relative cursor-pointer group"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
				>
					{/* Stacked cards effect */}
					{deckCount > 2 && (
						<div className="absolute -bottom-1 -right-1 w-24 h-36 md:w-28 md:h-40 rounded-lg bg-crimson-dark/60 dark:bg-midnight/60 border border-gold/20 dark:border-silver/20" />
					)}
					{deckCount > 1 && (
						<div className="absolute -bottom-0.5 -right-0.5 w-24 h-36 md:w-28 md:h-40 rounded-lg bg-crimson-dark/80 dark:bg-midnight/80 border border-gold/30 dark:border-silver/30" />
					)}

					{/* Top card or empty deck */}
					{deckCount > 0 ? (
						<div className="relative w-24 h-36 md:w-28 md:h-40 rounded-lg bg-gradient-to-br from-crimson via-crimson-dark to-crimson-deeper dark:from-midnight dark:via-midnight-deep dark:to-midnight-deeper border-2 border-gold dark:border-silver shadow-xl overflow-hidden">
							<div className="absolute inset-2 border border-gold/40 dark:border-silver/40 rounded-md">
								<div className="absolute inset-0 opacity-20 bg-[url('/ornate-victorian-damask-pattern-gold.jpg')] bg-cover" />
							</div>

							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold/20 dark:bg-silver/20 border-2 border-gold dark:border-silver flex items-center justify-center">
									<motion.span
										className="text-2xl md:text-3xl"
										animate={{ scale: [1, 1.1, 1] }}
										transition={{
											duration: 2,
											repeat: Number.POSITIVE_INFINITY,
										}}
									>
										💌
									</motion.span>
								</div>
							</div>

							<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-full transform" />
						</div>
					) : (
						<div className="relative w-24 h-36 md:w-28 md:h-40 rounded-lg border-2 border-dashed border-gold/30 dark:border-silver/30 flex items-center justify-center">
							<span className="text-gold/50 dark:text-silver/50 text-sm">
								Empty
							</span>
						</div>
					)}

					{/* Card count badge */}
					<motion.div
						key={deckCount}
						initial={{ scale: 1.3 }}
						animate={{ scale: 1 }}
						className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold dark:bg-silver text-crimson-dark dark:text-midnight font-bold flex items-center justify-center shadow-lg border-2 border-cream dark:border-midnight"
					>
						{deckCount}
					</motion.div>

					<p className="text-center mt-2 text-sm text-crimson-dark dark:text-silver-light font-medium">
						Draw Deck
					</p>
				</motion.div>

				{/* Discard Pile - Now clickable to view all */}
				<div className="relative" data-tour="discard-pile">
					<motion.div
						className="relative w-24 h-36 md:w-28 md:h-40 cursor-pointer group"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => setShowDiscardPile(true)}
					>
						<AnimatePresence mode="popLayout">
							{discardPile.length > 0 ? (
								<div className="relative w-full h-full">
									{discardPile.slice(-3).map((card, index) => (
										<motion.div
											key={card.id}
											initial={{ x: -100, opacity: 0, rotateY: 180 }}
											animate={{
												x: 0,
												opacity: 1,
												rotateY: 0,
												rotate: (index - 1) * 5,
												y: index * -2,
											}}
											exit={{ x: 100, opacity: 0, rotateY: -180, scale: 0.8 }}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 25,
											}}
											className="absolute inset-0"
											style={{ zIndex: index }}
										>
											<GameCardComponent card={card} size="medium" faceUp />
										</motion.div>
									))}

									{/* Hover overlay */}
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
										<div className="bg-cream/90 dark:bg-midnight/90 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
											<Eye className="w-4 h-4 text-crimson-dark dark:text-silver" />
											<span className="text-xs font-medium text-crimson-dark dark:text-silver">
												View All
											</span>
										</div>
									</div>
								</div>
							) : (
								<div className="w-full h-full rounded-lg border-2 border-dashed border-gold/30 dark:border-silver/30 flex items-center justify-center">
									<Layers className="w-6 h-6 text-gold/30 dark:text-silver/30" />
								</div>
							)}
						</AnimatePresence>
					</motion.div>

					<p className="text-center mt-2 text-sm text-crimson-dark dark:text-silver-light font-medium">
						Discard ({discardPile.length})
					</p>
				</div>
			</div>

			{/* Removed Cards */}
			<div className="flex flex-col items-center gap-2">
				<p className="text-xs text-muted-foreground uppercase tracking-wider">
					Removed from Game
				</p>
				<div className="flex gap-2">
					{removedCards.map((card, index) => (
						<motion.div
							key={card.id}
							initial={{ scale: 0, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ delay: index * 0.1 }}
						>
							<GameCardComponent card={card} size="small" faceUp={false} />
						</motion.div>
					))}
				</div>
			</div>
		</div>
	);
}
