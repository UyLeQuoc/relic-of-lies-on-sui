"use client";

import { useState } from "react";
import { ActionBanner } from "./action-banner";
import { GameProvider, useGame } from "./game-context";
import { PlayArea } from "./play-area";
import { PlayerHUD } from "./player-hud";
import { PlayersZone } from "./players-zone";
import { ResultNotification } from "./result-notification";
import { StartScreen } from "./start-screen";
import { TopBar } from "./top-bar";
import { TurnIndicator } from "./turn-indicator";

function GameContent() {
	const [isDarkMode, setIsDarkMode] = useState(false);
	const [isRulesOpen, setIsRulesOpen] = useState(false);
	const [isCardTutorialOpen, setIsCardTutorialOpen] = useState(false);
	const { gamePhase, startGame, resultNotification } = useGame();
	const [isSoundOn, setIsSoundOn] = useState(true);

	if (gamePhase === "setup") {
		return (
			<div className={isDarkMode ? "dark" : ""}>
				<StartScreen
					onOpenRules={() => setIsRulesOpen(true)}
					onOpenCardTutorial={() => setIsCardTutorialOpen(true)}
					onStartGuideTour={() => {}}
				/>
				{/* Modals will be added in Phase 6 */}
			</div>
		);
	}

	return (
		<div className={isDarkMode ? "dark" : ""}>
			<div className="min-h-screen bg-cream dark:bg-midnight transition-colors duration-500 relative overflow-hidden">
				{/* Background overlays */}
				<div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none bg-[url('/subtle-parchment-texture-with-faint-rose-patterns.jpg')] bg-repeat" />
				<div className="absolute inset-0 opacity-5 dark:opacity-5 pointer-events-none bg-[url('/delicate-vintage-rose-floral-pattern-seamless.jpg')] bg-repeat" />

				<div className="relative z-10 flex flex-col h-screen">
					<TopBar
						isDarkMode={isDarkMode}
						setIsDarkMode={setIsDarkMode}
						isSoundOn={isSoundOn}
						setIsSoundOn={setIsSoundOn}
						onRulesClick={() => setIsRulesOpen(true)}
						onCardTutorialClick={() => setIsCardTutorialOpen(true)}
						onGuideTourClick={() => {}}
					/>

					<div className="flex-1 flex flex-col overflow-hidden">
						<main className="flex-1 flex flex-col items-center justify-between gap-4 p-4 overflow-hidden">
							<PlayArea />
							<PlayersZone />
						</main>
					</div>

					<PlayerHUD />
				</div>

				{/* Modals will be added in Phase 6 */}
				<ActionBanner />
				<TurnIndicator />

				{resultNotification && (
					<ResultNotification
						type={resultNotification.type}
						title={resultNotification.title}
						message={resultNotification.message}
						icon={resultNotification.icon}
					/>
				)}
			</div>
		</div>
	);
}

export function LoveLetterGame() {
	return (
		<GameProvider>
			<GameContent />
		</GameProvider>
	);
}
