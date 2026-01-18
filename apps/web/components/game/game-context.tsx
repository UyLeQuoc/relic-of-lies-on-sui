"use client";

import type React from "react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

export type ActionPhase =
	| "idle"
	| "thinking"
	| "drawing"
	| "playing"
	| "effect"
	| "result";

export type CardType =
  | "unknown"
	| "guard"
	| "priest"
	| "baron"
	| "handmaid"
	| "prince"
	| "chancellor"
	| "king"
	| "countess"
	| "princess"
	| "spy";

export interface GameCard {
	id: string;
	type: CardType;
	name: string;
	value: number;
	description: string;
	count: number;
}

export interface Player {
	id: string;
	name: string;
	avatar: string;
	hand: GameCard[];
	discardedCards: GameCard[];
	isEliminated: boolean;
	eliminationReason?: string;
	isProtected: boolean;
	hearts: number;
	isBot: boolean;
	playedSpy: boolean;
}

export interface GameLog {
	id: string;
	message: string;
	timestamp: Date;
	type: "action" | "info" | "elimination" | "win";
}

export interface RevealedCard {
	playerId: string;
	playerName: string;
	card: GameCard;
	isBaronComparison?: boolean;
	opponentCard?: GameCard;
	opponentName?: string;
}

export interface ActionAnnouncement {
	playerId: string;
	playerName: string;
	card: GameCard;
	targetName?: string;
	guess?: string;
	result?: string;
	phase: ActionPhase;
}

interface ResultNotificationProps {
	type: "success" | "failure" | "info" | "neutral";
	title: string;
	message: string;
	icon?: React.ReactNode;
}

interface GameContextType {
	players: Player[];
	deck: GameCard[];
	discardPile: GameCard[];
	removedCards: GameCard[];
	deckCount: number;
	currentPlayerIndex: number;
	gamePhase:
		| "setup"
		| "playing"
		| "roundEnd"
		| "gameEnd"
		| "chancellorChoice"
		| "chancellorReturnOrder";
	roundNumber: number;
	heartsToWin: number;
	selectedCard: GameCard | null;
	selectedTarget: Player | null;
	selectedGuess: CardType | null;
	gameLogs: GameLog[];
	revealedCard: RevealedCard | null;
	chancellorCards: GameCard[];
	chancellorReturnCards: GameCard[];
	roundWinner: Player | null;
	gameWinner: Player | null;
	actionAnnouncement: ActionAnnouncement | null;
	isBotThinking: boolean;
	showDiscardPile: boolean;
	actionPhase: ActionPhase;
	isProcessingAction: boolean;
	currentActionText: string;
	resultNotification: ResultNotificationProps | null;
	roundWinnerReason: string;
	currentRound: number;
	totalRounds: number;
	setResultNotification: (notification: ResultNotificationProps | null) => void;
	setSelectedCard: (card: GameCard | null) => void;
	setSelectedTarget: (player: Player | null) => void;
	setSelectedGuess: (guess: CardType | null) => void;
	playCard: () => void;
	startGame: (botCount: number) => void;
	startNewRound: () => void;
	startNewGame: () => void;
	closeReveal: () => void;
	selectChancellorCard: (cardId: string) => void;
	handleChancellorReturnOrder: (
		firstCardId: string,
		secondCardId: string,
	) => void;
	setShowDiscardPile: (show: boolean) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return context;
}

const CARD_DATA: Omit<GameCard, "id">[] = [
	{
		type: "spy",
		name: "Scout",
		value: 0,
		description:
			"At round end, if only you played or discarded a Scout, gain 1 Relic.",
		count: 2,
	},
	{
		type: "guard",
		name: "Knight",
		value: 1,
		description:
			"Name a card (except Knight). If that target holds it, they are eliminated.",
		count: 6,
	},
	{
		type: "priest",
		name: "Healer",
		value: 2,
		description: "Choose and privately look at another player's hand.",
		count: 2,
	},
	{
		type: "baron",
		name: "Berserker",
		value: 3,
		description:
			"Privately compare hands with another player. Lower card is eliminated.",
		count: 2,
	},
	{
		type: "handmaid",
		name: "Cleric",
		value: 4,
		description: "You are immune to all card effects until your next turn.",
		count: 2,
	},
	{
		type: "prince",
		name: "Wizard",
		value: 5,
		description:
			"Choose any player. They discard their card and draw a new one.",
		count: 2,
	},
	{
		type: "chancellor",
		name: "Tactician",
		value: 6,
		description:
			"Draw 2 cards. Keep one and place the others at the bottom in any order.",
		count: 2,
	},
	{
		type: "king",
		name: "Paladin",
		value: 7,
		description: "Choose and swap your hand with another player's hand.",
		count: 1,
	},
	{
		type: "countess",
		name: "Cursed Idol",
		value: 8,
		description:
			"Must be discarded if held with Wizard or Paladin. Otherwise, no effect.",
		count: 1,
	},
	{
		type: "princess",
		name: "Sacred Crystal",
		value: 9,
		description:
			"If you play or discard this card, you are immediately eliminated.",
		count: 1,
	},
];

const BOT_AVATARS = [
	"/elegant-victorian-lady-portrait.jpg",
	"/distinguished-victorian-gentleman-portrait.jpg",
	"/mysterious-masked-noble-portrait.jpg",
];

const BOT_NAMES = ["Shadow Sorcerer", "Void Whisperer", "Arcane Deceiver"];

const DELAYS = {
	thinking: { min: 1200, max: 2000 },
	drawing: 800,
	showCard: 1500,
	showEffect: 2000,
	showResult: 2500,
	beforeNextTurn: 600,
};

function createDeck(): GameCard[] {
	const cards: GameCard[] = [];
	CARD_DATA.forEach((cardData) => {
		for (let i = 0; i < cardData.count; i++) {
			cards.push({
				...cardData,
				id: `${cardData.type}-${i}-${Math.random().toString(36).substr(2, 9)}`,
			});
		}
	});
	return cards.sort(() => Math.random() - 0.5);
}

export function GameProvider({ children }: { children: ReactNode }) {
	const [players, setPlayers] = useState<Player[]>([]);
	const [deck, setDeck] = useState<GameCard[]>([]);
	const [discardPile, setDiscardPile] = useState<GameCard[]>([]);
	const [removedCards, setRemovedCards] = useState<GameCard[]>([]);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [gamePhase, setGamePhase] = useState<
		| "setup"
		| "playing"
		| "roundEnd"
		| "gameEnd"
		| "chancellorChoice"
		| "chancellorReturnOrder"
	>("setup");
	const [roundNumber, setRoundNumber] = useState(1);
	const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
	const [selectedTarget, setSelectedTarget] = useState<Player | null>(null);
	const [selectedGuess, setSelectedGuess] = useState<CardType | null>(null);
	const [gameLogs, setGameLogs] = useState<GameLog[]>([]);
	const [revealedCard, setRevealedCard] = useState<RevealedCard | null>(null);
	const [chancellorCards, setChancellorCards] = useState<GameCard[]>([]);
	const [chancellorReturnCards, setChancellorReturnCards] = useState<
		GameCard[]
	>([]);
	const [roundWinner, setRoundWinner] = useState<Player | null>(null);
	const [gameWinner, setGameWinner] = useState<Player | null>(null);
	const [actionAnnouncement, setActionAnnouncement] =
		useState<ActionAnnouncement | null>(null);
	const [isBotThinking, setIsBotThinking] = useState(false);
	const [showDiscardPile, setShowDiscardPile] = useState(false);
	const [actionPhase, setActionPhase] = useState<ActionPhase>("idle");
	const [isProcessingAction, setIsProcessingAction] = useState(false);
	const [currentActionText, setCurrentActionText] = useState("");
	const [resultNotification, setResultNotification] =
		useState<ResultNotificationProps | null>(null);
	const [roundWinnerReason, setRoundWinnerReason] = useState<string>("");

	const gameStateRef = useRef<{
		players: Player[];
		deck: GameCard[];
		currentPlayerIndex: number;
		gamePhase: string;
	}>({ players: [], deck: [], currentPlayerIndex: 0, gamePhase: "setup" });

	const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		gameStateRef.current = { players, deck, currentPlayerIndex, gamePhase };
	}, [players, deck, currentPlayerIndex, gamePhase]);

	const addLog = useCallback(
		(message: string, type: GameLog["type"] = "info") => {
			setGameLogs((prev) => [
				{
					id: `log-${Date.now()}-${Math.random()}`,
					message,
					timestamp: new Date(),
					type,
				},
				...prev,
			]);
		},
		[],
	);

	const eliminatePlayer = useCallback(
		(playerId: string, reason: string) => {
			setPlayers((prev) =>
				prev.map((p) =>
					p.id === playerId
						? { ...p, isEliminated: true, eliminationReason: reason }
						: p,
				),
			);
			addLog(`${playerId} has been eliminated: ${reason}`, "elimination");
		},
		[addLog],
	);

	const handlePointAward = useCallback(
		(winner: Player, allPlayers: Player[], reason: string) => {
			const spyPlayers = allPlayers.filter((p) => p.playedSpy);
			const bonusPointPlayerId =
				spyPlayers.length === 1 ? spyPlayers[0]?.id : null;

			setPlayers((prev) => {
				const updatedPlayers = prev.map((p) => {
					let newHearts = p.hearts;
					if (p.id === winner.id) newHearts += 1;
					if (bonusPointPlayerId && p.id === bonusPointPlayerId) {
						newHearts += 1;
						addLog(`${p.name} earned a bonus point from the Scout!`, "win");
					}
					return { ...p, hearts: newHearts };
				});

				const finalWinner = updatedPlayers.find((p) => p.hearts >= 3);
				if (finalWinner) {
					setGameWinner(finalWinner);
					setGamePhase("gameEnd");
					addLog(`${finalWinner.name} has claimed ultimate victory!`, "win");
				} else {
					setRoundWinner(winner);
					setRoundWinnerReason(reason);
					setGamePhase("roundEnd");
					addLog(`${winner.name} wins the round: ${reason}`, "win");
				}

				return updatedPlayers;
			});
		},
		[addLog],
	);

	const checkRoundEnd = useCallback(
		(currentPlayers: Player[], currentDeck: GameCard[]) => {
			const activePlayers = currentPlayers.filter((p) => !p.isEliminated);

			// Only one player left - they win
			if (activePlayers.length === 1) {
				const winner = activePlayers[0];
				if (winner) {
					handlePointAward(winner, currentPlayers, "Only player remaining");
				}
				return true;
			}

			// Deck empty - all active players reveal
			if (
				currentDeck.length === 0 &&
				activePlayers.every((p) => p.hand.length === 1)
			) {
				const firstPlayer = activePlayers[0];
				if (!firstPlayer?.hand[0]) return false;

				let winner = firstPlayer;

				for (let i = 1; i < activePlayers.length; i++) {
					const player = activePlayers[i];
					const playerCard = player?.hand[0];
					const winnerCard = winner.hand[0];
					if (playerCard && winnerCard && playerCard.value > winnerCard.value) {
						winner = player;
					}
				}

				handlePointAward(winner, currentPlayers, "Highest card value");
				return true;
			}

			return false;
		},
		[handlePointAward],
	);

	const executeCardEffect = useCallback(
		(
			card: GameCard,
			player: Player,
			target: Player | null,
			guess: CardType | undefined,
		) => {
			setIsProcessingAction(true);
			addLog(`${player.name} played ${card.name}`, "action");

			switch (card.type) {
				case "guard":
					if (target && guess) {
						const targetCard = target.hand[0];
						const isCorrect = targetCard?.type === guess;
						if (isCorrect) {
							eliminatePlayer(target.id, `Correctly guessed ${guess}`);
							setResultNotification({
								type: "success",
								title: "Elimination!",
								message: `${player.name} correctly guessed ${target.name}'s card.`,
							});
						} else {
							setResultNotification({
								type: "failure",
								title: "Safe",
								message: `${player.name} guessed incorrectly, but ${target.name} is safe.`,
							});
						}
					} else if (target && target.isProtected) {
						setResultNotification({
							type: "info",
							title: "Discarded",
							message: `${target.name} is protected. Knight discarded with no effect.`,
						});
						addLog(
							`${player.name} played Knight on protected ${target.name}`,
							"info",
						);
					}
					break;

				case "priest":
					if (target) {
						setTimeout(() => {
							setRevealedCard({
								playerId: target.id,
								playerName: target.name,
								card: target.hand[0] || {
									type: "spy",
									name: "Empty",
									value: 0,
									description: "",
									count: 0,
									id: "",
								},
							});
						}, 500);

						setResultNotification({
							type: "info",
							title: "Healer Revealed",
							message: `${player.name} peeked at ${target.name}'s hand.`,
						});
					}
					break;

				case "baron":
					if (target) {
						const playerCard = player.hand[0];
						const targetCard = target.hand[0];
						if (playerCard && targetCard) {
							setRevealedCard({
								playerId: player.id,
								playerName: player.name,
								card: playerCard,
								isBaronComparison: true,
								opponentCard: targetCard,
								opponentName: target.name,
							});

							if (playerCard.value < targetCard.value) {
								eliminatePlayer(
									player.id,
									`Value ${playerCard.value} vs ${targetCard.value}`,
								);
							} else if (targetCard.value < playerCard.value) {
								eliminatePlayer(
									target.id,
									`Value ${targetCard.value} vs ${playerCard.value}`,
								);
							}
						}
					}
					break;

				case "handmaid":
					setPlayers((prev) =>
						prev.map((p) =>
							p.id === player.id ? { ...p, isProtected: true } : p,
						),
					);
					setResultNotification({
						type: "info",
						title: "Protected",
						message: `${player.name} is immune to all card effects until their next turn.`,
					});
					addLog(`${player.name} is protected until their next turn`, "action");
					break;

				case "prince":
					if (target) {
						const discardedCard = target.hand[0];
						if (discardedCard?.type === "princess") {
							eliminatePlayer(
								target.id,
								"Discarded the Sacred Crystal via Wizard",
							);
							setResultNotification({
								type: "success",
								title: "Sacred Crystal Discarded!",
								message: `${target.name} was forced to discard the Sacred Crystal. Eliminated!`,
							});
						} else {
							setResultNotification({
								type: "neutral",
								title: "Card Discarded",
								message: `${target.name} discarded ${discardedCard?.name} and drew a new card.`,
							});
						}
						addLog(
							`${player.name} made ${target.name} discard and draw`,
							"action",
						);
					}
					break;

				case "king":
					if (target) {
						const playerHand = [...player.hand];
						const targetHand = [...target.hand];
						setPlayers((prev) =>
							prev.map((p) => {
								if (p.id === player.id) return { ...p, hand: targetHand };
								if (p.id === target.id) return { ...p, hand: playerHand };
								return p;
							}),
						);
						setResultNotification({
							type: "neutral",
							title: "Hands Swapped",
							message: `${player.name} traded hands with ${target.name}.`,
						});
						addLog(`${player.name} traded hands with ${target.name}`, "action");
					}
					break;

				case "princess":
					eliminatePlayer(player.id, "Discarded the Sacred Crystal");
					break;

				case "chancellor":
					setDeck((currentDeck) => {
						const cardsToDraw = currentDeck.slice(0, 2);
						const currentHandCard = player.hand[0];
						if (currentHandCard) {
							setChancellorCards([currentHandCard, ...cardsToDraw]);
						}
						// Clear current hand card so it's not "held" twice
						setPlayers((prev) =>
							prev.map((p) => (p.id === player.id ? { ...p, hand: [] } : p)),
						);
						setGamePhase("chancellorChoice");
						return currentDeck.slice(2);
					});
					break;

				case "spy":
					setPlayers((prev) =>
						prev.map((p) =>
							p.id === player.id ? { ...p, playedSpy: true } : p,
						),
					);
					setResultNotification({
						type: "info",
						title: "Scout Played",
						message: `${player.name} played Scout. Bonus point at round end if only Scout played.`,
					});
					break;

				default:
					break;
			}
		},
		[addLog, eliminatePlayer],
	);

	const nextTurn = useCallback(() => {
		setIsProcessingAction(false);

		// Delayed turn advancement to prevent rapid loops
		turnTimeoutRef.current = setTimeout(() => {
			setCurrentPlayerIndex((prevIndex) => {
				const currentState = gameStateRef.current;
				const currentPlayers = currentState.players;
				const currentDeck = currentState.deck;

				// Check if round should end BEFORE advancing turn
				const roundEnded = checkRoundEnd(currentPlayers, currentDeck);
				if (roundEnded) return prevIndex;

				// Find next active player
				let nextIndex = (prevIndex + 1) % currentPlayers.length;
				let attempts = 0;
				while (
					currentPlayers[nextIndex]?.isEliminated &&
					attempts < currentPlayers.length
				) {
					nextIndex = (nextIndex + 1) % currentPlayers.length;
					attempts++;
				}

				// If deck has cards, draw one for the next player
				if (currentDeck.length > 0) {
					const drawnCard = currentDeck[0];
					if (drawnCard) {
						setDeck(currentDeck.slice(1));

						setPlayers((prev) =>
							prev.map((p, i) => {
								if (i === nextIndex) {
									return {
										...p,
										hand: [...p.hand, drawnCard],
										isProtected: false,
									};
								}
								return p;
							}),
						);
					}
				}

				// Schedule bot play if needed
				const nextPlayer = currentPlayers[nextIndex];
				if (
					nextPlayer?.isBot &&
					!nextPlayer.isEliminated &&
					currentState.gamePhase === "playing"
				) {
					setTimeout(() => {
						setIsBotThinking(true);
						setCurrentActionText(`${nextPlayer.name} is pondering...`);

						setTimeout(
							() => {
								const updatedState = gameStateRef.current;
								const botPlayer =
									updatedState.players[updatedState.currentPlayerIndex];

								if (botPlayer?.isBot && botPlayer.hand.length >= 2) {
									const cardToPlay = botPlayer.hand[0];
									if (!cardToPlay) return;

									const validTargets = updatedState.players.filter(
										(p) =>
											!p.isEliminated &&
											p.id !== botPlayer.id &&
											!p.isProtected,
									);
									const target =
										validTargets.length > 0 ? validTargets[0] : null;

									setPlayers((prev) =>
										prev.map((p) =>
											p.id === botPlayer.id
												? {
														...p,
														hand: p.hand.filter((c) => c.id !== cardToPlay.id),
														discardedCards: [...p.discardedCards, cardToPlay],
													}
												: p,
										),
									);
									setDiscardPile((d) => [...d, cardToPlay]);
									executeCardEffect(
										cardToPlay,
										botPlayer,
										target || null,
										undefined,
									);

									setIsBotThinking(false);
									setCurrentActionText("");

									// Recursive call to nextTurn
									setTimeout(() => {
										nextTurn();
									}, DELAYS.beforeNextTurn);
								}
							},
							DELAYS.thinking.min +
								Math.random() * (DELAYS.thinking.max - DELAYS.thinking.min),
						);
					}, 400);
				}

				return nextIndex;
			});
		}, DELAYS.beforeNextTurn);
	}, [checkRoundEnd, executeCardEffect]);

	const playCard = useCallback(() => {
		const currentState = gameStateRef.current;
		if (currentState.gamePhase !== "playing" || isProcessingAction) return;

		const currentPlayer = currentState.players[currentState.currentPlayerIndex];
		if (
			!currentPlayer ||
			currentPlayer.isBot ||
			currentPlayer.hand.length !== 2
		)
			return;

		const card = selectedCard;
		if (!card) return;

		setIsProcessingAction(true);

		// Play card: remove from hand (now player has 1 card left)
		setPlayers((prev) =>
			prev.map((p) =>
				p.id === currentPlayer.id
					? {
							...p,
							hand: p.hand.filter((c) => c.id !== card.id),
							discardedCards: [...p.discardedCards, card],
						}
					: p,
			),
		);
		setDiscardPile((d) => [...d, card]);

		// Execute card effect
		executeCardEffect(
			card,
			currentPlayer,
			selectedTarget || null,
			selectedGuess || undefined,
		);

		setSelectedCard(null);
		setSelectedTarget(null);
		setSelectedGuess(null);

		// Advance turn after effect
		setTimeout(() => {
			nextTurn();
		}, DELAYS.showEffect);
	}, [
		selectedCard,
		selectedTarget,
		selectedGuess,
		executeCardEffect,
		nextTurn,
		isProcessingAction,
	]);

	const startGame = useCallback(
		(botCount: number) => {
			const newDeck = createDeck();
			const removed = newDeck.splice(0, 1);
			setRemovedCards(removed);

			const drawnCard = newDeck.shift();
			const playerFirstCard = newDeck.shift();
			const botCard = newDeck.shift();

			if (!drawnCard || !playerFirstCard || !botCard) {
				console.error("Not enough cards in deck");
				return;
			}

			const initialPlayers: Player[] = [
				{
					id: "player-0",
					name: "You",
					avatar: "/noble-person-portrait-elegant.jpg",
					hand: [playerFirstCard, drawnCard],
					discardedCards: [],
					isEliminated: false,
					isProtected: false,
					hearts: 0,
					isBot: false,
					playedSpy: false,
				},
				{
					id: "bot-0",
					name: BOT_NAMES[0] || "Bot",
					avatar: BOT_AVATARS[0] || "/placeholder.svg",
					hand: [botCard],
					discardedCards: [],
					isEliminated: false,
					isProtected: false,
					hearts: 0,
					isBot: true,
					playedSpy: false,
				},
			];

			setPlayers(initialPlayers);
			setDeck(newDeck);
			setDiscardPile([]);
			setCurrentPlayerIndex(0);
			setRoundNumber(1);
			setGamePhase("playing");
			setGameLogs([]);
			setActionPhase("idle");
			setCurrentActionText("");
			setResultNotification(null);
			setRoundWinnerReason("");
			addLog(
				"Two souls meet in the mystical depths. Only one can claim the Relic of Lies...",
				"info",
			);
		},
		[addLog],
	);

	const startNewRound = useCallback(() => {
		// Shuffle and re-deal for a new round
		const newDeck = createDeck();
		const removed = newDeck.splice(0, 1);
		setRemovedCards(removed);

		setPlayers((prev) => {
			const updatedPlayers = prev.map((p) => {
				const card = newDeck.shift();
				if (!card) return p;
				return {
					...p,
					hand: [card],
					discardedCards: [],
					isEliminated: false,
					isProtected: false,
					playedSpy: false,
				};
			});
			return updatedPlayers;
		});

		// Current player (winner of last round or next in line) draws their second card
		const firstPlayerDrawnCard = newDeck.shift();
		if (firstPlayerDrawnCard) {
			setPlayers((prev) =>
				prev.map((p, i) =>
					i === currentPlayerIndex
						? { ...p, hand: [...p.hand, firstPlayerDrawnCard] }
						: p,
				),
			);
		}

		setDeck(newDeck);
		setDiscardPile([]);
		setRoundWinner(null);
		setRoundNumber((prev) => prev + 1);
		setGamePhase("playing");
		setResultNotification(null);
		setRoundWinnerReason("");
		addLog(
			`Round ${roundNumber + 1} begins. The deck is shuffled anew.`,
			"info",
		);
	}, [currentPlayerIndex, roundNumber, addLog]);

	const startNewGame = useCallback(() => {
		setGamePhase("setup");
		setPlayers([]);
		setDeck([]);
		setRoundNumber(1);
		setGameWinner(null);
		setResultNotification(null);
		setRoundWinnerReason("");
	}, []);

	const closeReveal = useCallback(() => {
		setRevealedCard(null);
		setResultNotification(null);
	}, []);

	const selectChancellorCard = useCallback(
		(cardId: string) => {
			const cardToKeep = chancellorCards.find((c) => c.id === cardId);
			const cardsToReturn = chancellorCards.filter((c) => c.id !== cardId);

			if (!cardToKeep || cardsToReturn.length !== 2) return;

			const currentPlayerId =
				gameStateRef.current.players[gameStateRef.current.currentPlayerIndex]
					?.id;
			if (!currentPlayerId) return;

			// Set the kept card back to player's hand
			setPlayers((prev) =>
				prev.map((p) =>
					p.id === currentPlayerId ? { ...p, hand: [cardToKeep] } : p,
				),
			);

			// Store the cards to return and transition to ordering phase
			setChancellorReturnCards(cardsToReturn);
			setChancellorCards([]);
			setGamePhase("chancellorReturnOrder");
			addLog(`Chancellor chose to keep ${cardToKeep.name}`, "info");
		},
		[chancellorCards, addLog],
	);

	const handleChancellorReturnOrder = useCallback(
		(firstCardId: string, secondCardId: string) => {
			const firstCard = chancellorReturnCards.find((c) => c.id === firstCardId);
			const secondCard = chancellorReturnCards.find(
				(c) => c.id === secondCardId,
			);

			if (!firstCard || !secondCard) return;

			// Return cards to the BOTTOM of the deck in the chosen order
			setDeck((prevDeck) => [...prevDeck, firstCard, secondCard]);
			setChancellorReturnCards([]);
			setGamePhase("playing");
			setResultNotification(null);

			addLog(`Chancellor returned 2 cards to the bottom of the deck`, "info");

			// Advance turn after a small delay
			setTimeout(() => {
				nextTurn();
			}, 800);
		},
		[chancellorReturnCards, nextTurn, addLog],
	);

	return (
		<GameContext.Provider
			value={{
				players,
				deck,
				discardPile,
				removedCards,
				deckCount: deck.length,
				currentPlayerIndex,
				gamePhase,
				roundNumber,
				heartsToWin: 3,
				selectedCard,
				selectedTarget,
				selectedGuess,
				gameLogs,
				revealedCard,
				chancellorCards,
				chancellorReturnCards,
				roundWinner,
				gameWinner,
				actionAnnouncement,
				isBotThinking,
				showDiscardPile,
				actionPhase,
				isProcessingAction,
				currentActionText,
				resultNotification,
				roundWinnerReason,
				currentRound: roundNumber,
				totalRounds: 3,
				setResultNotification,
				setSelectedCard,
				setSelectedTarget,
				setSelectedGuess,
				playCard,
				startGame,
				startNewRound,
				startNewGame,
				closeReveal,
				selectChancellorCard,
				handleChancellorReturnOrder,
				setShowDiscardPile,
			}}
		>
			{children}
		</GameContext.Provider>
	);
}
