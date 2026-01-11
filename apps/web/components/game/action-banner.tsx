"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Brain, CheckCircle, Clock, Sparkles, Swords } from "lucide-react";
import { useGame } from "./game-context";

export function ActionBanner() {
	const {
		currentActionText,
		actionPhase,
		isBotThinking,
		players,
		currentPlayerIndex,
		isProcessingAction,
	} = useGame();

	const currentPlayer = players[currentPlayerIndex];
	const showBanner =
		currentActionText ||
		isBotThinking ||
		(actionPhase !== "idle" && isProcessingAction);

	const getIcon = () => {
		if (isBotThinking || actionPhase === "thinking") {
			return <Brain className="w-4 h-4 animate-pulse" />;
		}
		switch (actionPhase) {
			case "drawing":
				return <Clock className="w-4 h-4" />;
			case "playing":
				return <Sparkles className="w-4 h-4" />;
			case "effect":
				return <Swords className="w-4 h-4" />;
			case "result":
				return <CheckCircle className="w-4 h-4" />;
			default:
				return <Sparkles className="w-4 h-4" />;
		}
	};

	const getBgColor = () => {
		if (isBotThinking || actionPhase === "thinking") {
			return "from-amber-500/90 to-orange-500/90";
		}
		switch (actionPhase) {
			case "playing":
				return "from-crimson/90 to-rose-600/90 dark:from-gold/90 dark:to-amber-500/90";
			case "effect":
				return "from-purple-500/90 to-indigo-500/90";
			case "result":
				return "from-emerald-500/90 to-green-600/90";
			default:
				return "from-crimson/90 to-rose-600/90 dark:from-gold/90 dark:to-amber-500/90";
		}
	};

	return (
		<AnimatePresence>
			{showBanner && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="fixed top-20 left-1/2 -translate-x-1/2 z-40"
				>
					<motion.div
						animate={{
							boxShadow: [
								"0 4px 20px rgba(0,0,0,0.2)",
								"0 4px 30px rgba(0,0,0,0.3)",
								"0 4px 20px rgba(0,0,0,0.2)",
							],
						}}
						transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
						className={`px-6 py-3 rounded-full bg-gradient-to-r ${getBgColor()} text-white shadow-lg flex items-center gap-3`}
					>
						{/* Player avatar */}
						{currentPlayer && (
							<motion.div
								animate={isBotThinking ? { rotate: [0, 5, -5, 0] } : {}}
								transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
								className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50"
							>
								<img
									src={currentPlayer.avatar || "/placeholder.svg"}
									alt={currentPlayer.name}
									className="w-full h-full object-cover"
								/>
							</motion.div>
						)}

						{/* Icon */}
						<motion.div
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
						>
							{getIcon()}
						</motion.div>

						{/* Text */}
						<span className="font-medium text-sm whitespace-nowrap">
							{currentActionText ||
								(isBotThinking
									? `${currentPlayer?.name} is thinking...`
									: "Processing...")}
						</span>

						{/* Thinking dots */}
						{(isBotThinking || actionPhase === "thinking") && (
							<div className="flex gap-1">
								{[0, 1, 2].map((i) => (
									<motion.div
										key={i}
										animate={{ opacity: [0.3, 1, 0.3] }}
										transition={{
											duration: 0.8,
											repeat: Number.POSITIVE_INFINITY,
											delay: i * 0.2,
										}}
										className="w-1.5 h-1.5 bg-white rounded-full"
									/>
								))}
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
