"use client";

import { BookOpen, LogOut, Map, Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "./game-context";

interface TopBarProps {
	isDarkMode: boolean;
	setIsDarkMode: (value: boolean) => void;
	isSoundOn: boolean;
	setIsSoundOn: (value: boolean) => void;
	onRulesClick: () => void;
	onCardTutorialClick: () => void;
	onGuideTourClick: () => void;
}

export function TopBar({
	isDarkMode,
	setIsDarkMode,
	isSoundOn,
	setIsSoundOn,
	onRulesClick,
	onCardTutorialClick,
	onGuideTourClick,
}: TopBarProps) {
	const { currentRound, totalRounds, heartsToWin, gamePhase, startNewGame } =
		useGame();

	return (
		<header
			data-tour="top-bar"
			className="h-16 bg-crimson/90 dark:bg-midnight-deep/90 backdrop-blur-sm border-b border-gold/30 dark:border-silver/30 px-4 flex items-center justify-between shadow-lg relative z-50"
		>
			{/* Left: Game Title */}
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-gold/20 dark:bg-silver/20 flex items-center justify-center">
					<span className="text-2xl">💌</span>
				</div>
				<h1 className="font-serif text-2xl md:text-3xl font-bold text-gold dark:text-silver tracking-wide italic">
					Relic of Lies
				</h1>
			</div>

			{/* Right: Actions */}
			<div className="flex items-center gap-1 md:gap-2">
				<Button
					variant="ghost"
					size="icon"
					onClick={onCardTutorialClick}
					className="text-cream dark:text-silver hover:bg-gold/20 dark:hover:bg-silver/20"
					title="Card Reference Guide"
				>
					<Sparkles className="h-5 w-5" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={onGuideTourClick}
					className="text-cream dark:text-silver hover:bg-gold/20 dark:hover:bg-silver/20"
					title="UI Walkthrough"
				>
					<Map className="h-5 w-5" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={onRulesClick}
					className="text-cream dark:text-silver hover:bg-gold/20 dark:hover:bg-silver/20"
					title="Game Rules"
				>
					<BookOpen className="h-5 w-5" />
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => setIsDarkMode(!isDarkMode)}
					className="text-cream dark:text-silver hover:bg-gold/20 dark:hover:bg-silver/20"
					title={isDarkMode ? "Light Mode" : "Dark Mode"}
				>
					{isDarkMode ? (
						<Sun className="h-5 w-5" />
					) : (
						<Moon className="h-5 w-5" />
					)}
				</Button>

				{gamePhase !== "setup" && (
					<Button
						variant="ghost"
						size="sm"
						onClick={startNewGame}
						className="text-cream dark:text-silver hover:bg-crimson-dark/50 dark:hover:bg-silver/20 gap-2 hidden sm:flex"
					>
						<LogOut className="h-4 w-4" />
						<span>New Game</span>
					</Button>
				)}
			</div>
		</header>
	);
}
