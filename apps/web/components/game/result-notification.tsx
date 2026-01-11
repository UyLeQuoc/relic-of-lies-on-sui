"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Info, XCircle, Zap } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useGame } from "./game-context";

interface ResultNotificationProps {
	type: "success" | "failure" | "info" | "neutral";
	title: string;
	message: string;
	icon?: React.ReactNode;
	duration?: number;
}

// Auto-clear notification from context when timer completes
export function ResultNotification({
	type,
	title,
	message,
	icon,
	duration = 2500,
}: ResultNotificationProps) {
	const [isVisible, setIsVisible] = useState(true);
	const { setResultNotification } = useGame();

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(() => setResultNotification(null), 300);
		}, duration);
		return () => clearTimeout(timer);
	}, [duration, setResultNotification]);

	const getColor = () => {
		switch (type) {
			case "success":
				return "from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700";
			case "failure":
				return "from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-700";
			case "info":
				return "from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700";
			case "neutral":
				return "from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700";
		}
	};

	const getIcon = () => {
		if (icon) return icon;
		switch (type) {
			case "success":
				return <CheckCircle className="w-7 h-7" />;
			case "failure":
				return <XCircle className="w-7 h-7" />;
			case "info":
				return <Info className="w-7 h-7" />;
			case "neutral":
				return <Zap className="w-7 h-7" />;
		}
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, scale: 0.8, y: 30 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: -30 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
				>
					<motion.div
						animate={{
							boxShadow: [
								`0 0 30px rgba(212, 175, 55, 0.3)`,
								`0 0 50px rgba(212, 175, 55, 0.5)`,
								`0 0 30px rgba(212, 175, 55, 0.3)`,
							],
						}}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						className={`px-8 py-5 rounded-2xl bg-gradient-to-br ${getColor()} text-white shadow-2xl border-2 border-white/30 backdrop-blur-sm`}
					>
						<div className="flex items-center gap-5 max-w-md">
							<motion.div
								animate={{ scale: [1, 1.1, 1] }}
								transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
								className="flex-shrink-0"
							>
								{getIcon()}
							</motion.div>

							<div className="flex-1">
								<motion.h3
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.1 }}
									className="font-serif text-lg font-bold mb-0.5"
								>
									{title}
								</motion.h3>
								<motion.p
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.2 }}
									className="text-sm text-white/90"
								>
									{message}
								</motion.p>
							</div>
						</div>

						<motion.div
							initial={{ scaleX: 1 }}
							animate={{ scaleX: 0 }}
							transition={{ duration: duration / 1000, ease: "linear" }}
							className="absolute bottom-0 left-0 right-0 h-1 bg-white/40 rounded-b-2xl origin-left"
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
