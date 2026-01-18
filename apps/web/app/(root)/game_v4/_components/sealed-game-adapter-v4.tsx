"use client";

import type { GameCard, Player } from "@/components/game/game-context";
import { Button } from "@/components/ui/button";
import { GameTable } from "@/components/game-table";
import { GameCardComponent } from "@/components/game/game-card";
import { CardCharacter } from "@/components/common/game-ui/cards/card-character";
import { CardType as CardConceptCardType } from "@/components/common/game-ui/cards/types";
import { cn } from "@/lib/utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCallback, useEffect, useMemo, useState, useRef, useLayoutEffect } from "react";
import {
  useGetRoomV4,
  usePlayTurnV4,
  useResolveChancellorV4,
  useRespondGuardV4,
  useRespondBaronV4,
  useRespondPrinceV4,
  useSubmitEncryptedDeck,
  useStartNewGameV4,
  usePlayerIndexV4,
  useIsMyTurnV4,
  useMyHandIndicesV4,
  usePendingActionV4,
  useNeedToRespondV4,
  GameStatus,
  PendingActionType,
  CardNames,
  type GameRoomV4Type,
} from "@/hooks/use-game-contract-v4";
import { useDecryptCards, type DecryptedCard } from "@/hooks/use-seal-client";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Loader2, Lock, Shield, Eye, EyeOff, AlertTriangle } from "lucide-react";

// Card data mapping for game components
const CARD_DATA_MAP: Record<number, Omit<GameCard, "id">> = {
  0: { type: "spy", name: "Spy", value: 0, description: "At round end, if only you played or discarded a Spy, gain 1 token.", count: 2 },
  1: { type: "guard", name: "Guard", value: 1, description: "Name a card (except Guard). If that target holds it, they are eliminated.", count: 6 },
  2: { type: "priest", name: "Priest", value: 2, description: "Choose and privately look at another player's hand.", count: 2 },
  3: { type: "baron", name: "Baron", value: 3, description: "Privately compare hands with another player. Lower card is eliminated.", count: 2 },
  4: { type: "handmaid", name: "Handmaid", value: 4, description: "You are immune to all card effects until your next turn.", count: 2 },
  5: { type: "prince", name: "Prince", value: 5, description: "Choose any player. They discard their card and draw a new one.", count: 2 },
  6: { type: "chancellor", name: "Chancellor", value: 6, description: "Draw 2 cards, keep 1, return 2 to bottom of deck in any order.", count: 2 },
  7: { type: "king", name: "King", value: 7, description: "Trade hands with another player.", count: 1 },
  8: { type: "countess", name: "Countess", value: 8, description: "Must be discarded if you have King or Prince.", count: 1 },
  9: { type: "princess", name: "Princess", value: 9, description: "If discarded (by you or forced), you are eliminated.", count: 1 },
};

function createCard(cardValue: number, id: string): GameCard {
  const data = CARD_DATA_MAP[cardValue];
  if (!data) {
    // Return a placeholder card for encrypted/unknown cards
    return {
      id,
      type: "unknown",
      name: "???",
      value: -1,
      description: "Encrypted card - decrypt to reveal",
      count: 0,
    };
  }
  return { id, ...data };
}

// Convert on-chain room to game state format
function convertRoomToGameState(
  room: GameRoomV4Type,
  currentAccount: string,
  decryptedCards: DecryptedCard[]
) {
  const myPlayerIndex = room.players.findIndex((p) => p.addr === currentAccount);
  const currentPlayerIndex = room.status === GameStatus.PLAYING
    ? Number(room.current_turn) % room.players.length
    : 0;

  // Create a map of decrypted card values by index
  const decryptedMap = new Map<number, number>();
  for (const dc of decryptedCards) {
    decryptedMap.set(dc.cardIndex, dc.value);
  }

  // Convert players
  const players: Player[] = room.players.map((p, idx) => {
    const hand = p.hand.map((cardIdx, handIdx) => {
      const cardIndex = Number(cardIdx);
      const value = decryptedMap.get(cardIndex);
      // Only show decrypted value for own cards
      if (idx === myPlayerIndex && value !== undefined && value >= 0) {
        return createCard(value, `player-${idx}-hand-${handIdx}-idx-${cardIndex}`);
      }
      // For others or undecrypted, show encrypted card
      return createCard(-1, `player-${idx}-hand-${handIdx}-idx-${cardIndex}`);
    });

    const discardedCards = p.discarded.map((cardValue, cardIdx) =>
      createCard(cardValue, `player-${idx}-discarded-${cardIdx}`)
    );

    return {
      id: p.addr,
      name: idx === myPlayerIndex ? "You" : `Player ${idx + 1}`,
      avatar: "/placeholder.svg",
      hand,
      discardedCards,
      isEliminated: !p.is_alive,
      isProtected: p.is_immune,
      hearts: p.tokens,
      isBot: idx !== myPlayerIndex,
      playedSpy: p.discarded.includes(0),
    };
  });

  // Deck count
  const deckCount = room.deck_indices.length;

  // Discard pile from all players
  const discardPile: GameCard[] = [];
  room.players.forEach((p, playerIdx) => {
    p.discarded.forEach((cardValue, cardIdx) => {
      discardPile.push(createCard(cardValue, `discard-${playerIdx}-${cardIdx}`));
    });
  });

  // Game phase
  let gamePhase: "setup" | "playing" | "roundEnd" | "gameEnd" | "chancellorChoice" = "setup";
  if (room.status === GameStatus.WAITING) {
    gamePhase = "setup";
  } else if (room.status === GameStatus.PLAYING) {
    if (room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx)) {
      gamePhase = "chancellorChoice";
    } else {
      gamePhase = "playing";
    }
  } else if (room.status === GameStatus.ROUND_END) {
    gamePhase = "roundEnd";
  } else if (room.status === GameStatus.FINISHED) {
    gamePhase = "gameEnd";
  }

  // Chancellor cards
  const chancellorCards = room.chancellor_card_indices.map((cardIdx, idx) => {
    const cardIndex = Number(cardIdx);
    const value = decryptedMap.get(cardIndex);
    if (value !== undefined && value >= 0) {
      return createCard(value, `chancellor-${idx}-idx-${cardIndex}`);
    }
    return createCard(-1, `chancellor-${idx}-idx-${cardIndex}`);
  });

  return {
    players,
    deck: [],
    discardPile,
    removedCards: [],
    deckCount,
    currentPlayerIndex,
    gamePhase,
    roundNumber: room.round_number,
    heartsToWin: room.tokens_to_win,
    myPlayerIndex,
    chancellorCards,
    pendingAction: room.pending_action,
  };
}

interface SealedGameAdapterV4Props {
  roomId: string;
}

export function SealedGameAdapterV4({ roomId }: SealedGameAdapterV4Props) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { room, fetchRoom, isLoading, error } = useGetRoomV4(roomId);
  const { submitDeck, isPending: isSubmittingDeck } = useSubmitEncryptedDeck();
  const { playTurn, isPending: isPlayingTurn } = usePlayTurnV4();
  const { respondGuard, isPending: isRespondingGuard } = useRespondGuardV4();
  const { respondBaron, isPending: isRespondingBaron } = useRespondBaronV4();
  const { respondPrince, isPending: isRespondingPrince } = useRespondPrinceV4();
  const { resolveChancellor, isPending: isResolvingChancellor } = useResolveChancellorV4();
  const { startNewGame, isPending: isStartingNewGame } = useStartNewGameV4();
  const { decryptCards, isDecrypting } = useDecryptCards();

  // Derived state
  const myPlayerIndex = usePlayerIndexV4(room);
  const isMyTurn = useIsMyTurnV4(room);
  const myHandIndices = useMyHandIndicesV4(room);
  const pendingAction = usePendingActionV4(room);
  const needToRespond = useNeedToRespondV4(room);

  // Local state
  const [decryptedCards, setDecryptedCards] = useState<DecryptedCard[]>([]);
  const [isWalletChecked, setIsWalletChecked] = useState(false);
  const [resultNotification, setResultNotification] = useState<{
    type: "success" | "failure" | "info";
    title: string;
    message: string;
  } | null>(null);

  // UI state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [chancellorKeepCard, setChancellorKeepCard] = useState<GameCard | null>(null);
  const [chancellorReturnOrder, setChancellorReturnOrder] = useState<GameCard[]>([]);
  const [showCardValues, setShowCardValues] = useState(true);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const turnIndicatorRef = useRef<HTMLDivElement>(null);

  // Round winner state
  const [roundWinner, setRoundWinner] = useState<{
    playerIndex: number;
    playerName: string;
    reason: string;
    cardValue?: number;
  } | null>(null);
  const prevGamePhaseRef = useRef<string>("");

  // Check wallet connection
  useEffect(() => {
    const timer = setTimeout(() => setIsWalletChecked(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch room periodically
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Track which card indices we've already decrypted to avoid re-decrypting
  const decryptedIndicesRef = useRef<Set<number>>(new Set());
  const isDecryptingRef = useRef(false);
  const lastHandIndicesRef = useRef<string>("");

  // Decrypt cards only when hand indices actually change (not on every room refresh)
  useEffect(() => {
    if (!room || myHandIndices.length === 0) return;

    // Create a stable key for current hand indices
    const chancellorIndices = room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx)
      ? room.chancellor_card_indices.map(Number)
      : [];
    const allIndices = [...myHandIndices, ...chancellorIndices].sort((a, b) => a - b);
    const indicesKey = allIndices.join(",");

    // Skip if indices haven't changed
    if (indicesKey === lastHandIndicesRef.current) {
      return;
    }

    // Find indices that need decryption (not already decrypted)
    const indicesToDecrypt = allIndices.filter(
      (idx) => !decryptedIndicesRef.current.has(idx)
    );

    // Skip if all cards already decrypted or already decrypting
    if (indicesToDecrypt.length === 0 || isDecryptingRef.current) {
      lastHandIndicesRef.current = indicesKey;
      return;
    }

    const doDecrypt = async () => {
      isDecryptingRef.current = true;
      try {
        const encryptedCards = room.encrypted_cards.map((card) => {
          if ("Encrypted" in card && card.Encrypted) {
            return { ciphertext: new Uint8Array(card.Encrypted.ciphertext) };
          } else if ("Decrypted" in card && card.Decrypted) {
            return { ciphertext: new Uint8Array(card.Decrypted.data) };
          }
          return { ciphertext: new Uint8Array() };
        });

        console.log("Decrypting new cards:", indicesToDecrypt);
        const decrypted = await decryptCards(roomId, indicesToDecrypt, encryptedCards);
        
        // Merge with existing decrypted cards
        setDecryptedCards((prev) => {
          const merged = [...prev];
          for (const dc of decrypted) {
            const existingIdx = merged.findIndex((m) => m.cardIndex === dc.cardIndex);
            if (existingIdx >= 0) {
              merged[existingIdx] = dc;
            } else {
              merged.push(dc);
            }
            decryptedIndicesRef.current.add(dc.cardIndex);
          }
          return merged;
        });

        lastHandIndicesRef.current = indicesKey;
      } catch (err) {
        console.error("Failed to decrypt cards:", err);
      } finally {
        isDecryptingRef.current = false;
      }
    };

    doDecrypt();
  }, [room, myHandIndices, roomId, decryptCards, myPlayerIndex]);

  // Reset decrypted cache when room changes (new game)
  useEffect(() => {
    if (room?.round_number === 0 && room?.status === GameStatus.PLAYING) {
      // New game started, clear cache
      decryptedIndicesRef.current.clear();
      lastHandIndicesRef.current = "";
    }
  }, [room?.round_number, room?.status]);

  // Convert room to game state
  const gameState = useMemo(() => {
    if (!room || !currentAccount?.address) return null;
    return convertRoomToGameState(room, currentAccount.address, decryptedCards);
  }, [room, currentAccount, decryptedCards]);

  // Get selected card object
  const selectedCard = useMemo(() => {
    if (!selectedCardId || !gameState) return null;
    const humanPlayer = gameState.players.find((p) => !p.isBot);
    return humanPlayer?.hand.find((c) => c.id === selectedCardId) || null;
  }, [selectedCardId, gameState]);

  // Check Countess rule
  const mustPlayCountess = useMemo(() => {
    if (!gameState) return false;
    const humanPlayer = gameState.players.find((p) => !p.isBot);
    if (!humanPlayer || humanPlayer.hand.length < 2) return false;
    const hasCountess = humanPlayer.hand.some((c) => c.value === 8);
    const hasKingOrPrince = humanPlayer.hand.some((c) => c.value === 7 || c.value === 5);
    return hasCountess && hasKingOrPrince;
  }, [gameState]);

  const countessCard = useMemo(() => {
    if (!mustPlayCountess || !gameState) return null;
    const humanPlayer = gameState.players.find((p) => !p.isBot);
    return humanPlayer?.hand.find((c) => c.value === 8) || null;
  }, [mustPlayCountess, gameState]);

  // Card requirements
  const cardRequiresTarget = (card: GameCard | null): boolean => {
    if (!card || card.value < 0) return false;
    return [1, 2, 3, 5, 7].includes(card.value);
  };

  const cardRequiresGuess = (card: GameCard | null): boolean => {
    if (!card) return false;
    return card.value === 1;
  };

  // Get valid targets
  const getValidTargets = useCallback(() => {
    if (!selectedCard || !gameState || gameState.myPlayerIndex < 0) return [];

    return gameState.players
      .map((p, idx) => ({ player: p, index: idx }))
      .filter(({ player, index }) => {
        const isSelf = index === gameState.myPlayerIndex;
        if (selectedCard.value !== 5 && isSelf) return false;
        if (player.isEliminated) return false;
        if (player.isProtected && !(selectedCard.value === 5 && isSelf)) return false;
        return true;
      });
  }, [selectedCard, gameState]);

  // Handle submit deck
  const handleSubmitDeck = async () => {
    try {
      await submitDeck(roomId);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Submit Deck",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Handle play card
  const handlePlayCard = async () => {
    if (!selectedCardId || !selectedCard || selectedCard.value < 0) return;

    // Extract card index from id
    const match = selectedCardId.match(/idx-(\d+)/);
    if (!match?.[1]) return;
    const cardIndex = parseInt(match[1], 10);
    const cardValue = selectedCard.value;

    // Get plaintext data for verification
    const decrypted = decryptedCards.find((dc) => dc.cardIndex === cardIndex);
    if (!decrypted) {
      setResultNotification({
        type: "failure",
        title: "Card Not Decrypted",
        message: "Please wait for card decryption to complete",
      });
      return;
    }

    try {
      let targetToUse = selectedTarget;
      if (cardValue === 5 && targetToUse === null && gameState) {
        targetToUse = gameState.myPlayerIndex;
      }

      // playTurn signature: (roomId, cardIndex, cardValue, targetIdx?, guess?)
      await playTurn(
        roomId,
        cardIndex,
        cardValue,
        targetToUse,
        selectedGuess
      );

      setSelectedCardId(null);
      setSelectedTarget(null);
      setSelectedGuess(null);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Play Card",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Handle pending action responses
  const handleRespondGuard = async () => {
    if (!pendingAction || myHandIndices.length === 0) return;
    const cardIndex = myHandIndices[0];
    if (cardIndex === undefined) return;
    const decrypted = decryptedCards.find((dc) => dc.cardIndex === cardIndex);
    if (!decrypted) return;

    try {
      // respondGuard signature: (roomId, cardIndex, cardValue)
      await respondGuard(roomId, cardIndex, decrypted.value);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Respond",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleRespondBaron = async () => {
    if (!pendingAction || myHandIndices.length === 0) return;
    const cardIndex = myHandIndices[0];
    if (cardIndex === undefined) return;
    const decrypted = decryptedCards.find((dc) => dc.cardIndex === cardIndex);
    if (!decrypted) return;

    try {
      // respondBaron signature: (roomId, cardIndex, cardValue)
      await respondBaron(roomId, cardIndex, decrypted.value);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Respond",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleRespondPrince = async () => {
    if (!pendingAction || myHandIndices.length === 0) return;
    const cardIndex = myHandIndices[0];
    if (cardIndex === undefined) return;
    const decrypted = decryptedCards.find((dc) => dc.cardIndex === cardIndex);
    if (!decrypted) return;

    try {
      // respondPrince signature: (roomId, cardIndex, cardValue)
      await respondPrince(roomId, cardIndex, decrypted.value);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Respond",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Handle chancellor resolution
  const handleResolveChancellor = async () => {
    if (!chancellorKeepCard || !room) return;

    // Extract card index from keep card id
    const keepMatch = chancellorKeepCard.id.match(/idx-(\d+)/);
    if (!keepMatch?.[1]) return;
    const keepCardIndex = parseInt(keepMatch[1], 10);

    // Get return indices
    const returnIndices = room.chancellor_card_indices
      .map((idx) => Number(idx))
      .filter((idx) => idx !== keepCardIndex);

    try {
      await resolveChancellor(roomId, keepCardIndex, returnIndices);
      setChancellorKeepCard(null);
      setChancellorReturnOrder([]);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Resolve Chancellor",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Handle start new game
  const handleStartNewGame = async () => {
    try {
      await startNewGame(roomId);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: "failure",
        title: "Failed to Start New Game",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  // Auto-select Countess
  useEffect(() => {
    if (mustPlayCountess && countessCard && isMyTurn && !selectedCardId) {
      setSelectedCardId(countessCard.id);
    }
  }, [mustPlayCountess, countessCard, isMyTurn, selectedCardId]);

  // Detect round end and show winner
  useEffect(() => {
    if (!gameState) return;

    if (gameState.gamePhase === "roundEnd" && prevGamePhaseRef.current !== "roundEnd") {
      const alivePlayers = gameState.players
        .map((p, idx) => ({ player: p, index: idx }))
        .filter(({ player }) => !player.isEliminated);

      if (alivePlayers.length === 1) {
        const roundWinnerData = alivePlayers[0];
        if (roundWinnerData) {
          setRoundWinner({
            playerIndex: roundWinnerData.index,
            playerName: roundWinnerData.player.name,
            reason: "Last one standing!",
            cardValue: roundWinnerData.player.hand[0]?.value,
          });
        }
      } else if (alivePlayers.length > 1) {
        let highestValue = -1;
        let roundWinnerData: { player: Player; index: number } | null = null;

        for (const item of alivePlayers) {
          const cardInHand = item.player.hand[0];
          if (cardInHand && cardInHand.value > highestValue) {
            highestValue = cardInHand.value;
            roundWinnerData = item;
          }
        }

        if (roundWinnerData) {
          setRoundWinner({
            playerIndex: roundWinnerData.index,
            playerName: roundWinnerData.player.name,
            reason: `Highest card (${highestValue})!`,
            cardValue: highestValue,
          });
        }
      }
    }

    if (gameState.gamePhase === "playing" && prevGamePhaseRef.current === "roundEnd") {
      setRoundWinner(null);
    }

    prevGamePhaseRef.current = gameState.gamePhase;
  }, [gameState]);

  // GSAP Animations
  useLayoutEffect(() => {
    if (!headerRef.current) return;
    gsap.fromTo(
      headerRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  useLayoutEffect(() => {
    if (!turnIndicatorRef.current || !isMyTurn) return;

    const pulse = gsap.to(turnIndicatorRef.current, {
      scale: 1.05,
      boxShadow: "0 0 30px rgba(251, 191, 36, 0.6)",
      duration: 0.8,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      pulse.kill();
    };
  }, [isMyTurn]);

  // Map card value to CardType enum
  const mapCardValueToCardType = (cardValue: number): CardConceptCardType => {
    const cardTypeMap: Record<number, CardConceptCardType> = {
      0: CardConceptCardType.Value0,
      1: CardConceptCardType.Value1,
      2: CardConceptCardType.Value2,
      3: CardConceptCardType.Value3,
      4: CardConceptCardType.Value4,
      5: CardConceptCardType.Value5,
      6: CardConceptCardType.Value6,
      7: CardConceptCardType.Value7,
      8: CardConceptCardType.Value8,
      9: CardConceptCardType.Value9,
    };
    return cardTypeMap[cardValue] || CardConceptCardType.Value0;
  };

  // In V4, deck is submitted when encrypted_cards has content
  // Check if deck has been submitted by checking if encrypted_cards exist
  const hasSubmittedDeck = room ? room.encrypted_cards.length > 0 : false;

  // Check if game is ready to start (all players joined and deck submitted)
  const allPlayersReady = room ? room.players.length >= 2 && hasSubmittedDeck : false;

  // Loading states
  if (!isWalletChecked || (isLoading && !room)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-400 mx-auto" />
          <p className="mt-4 text-amber-300">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Wallet Not Connected</h1>
          <p className="text-amber-300/70 mt-2">Please connect your wallet to play.</p>
          <Button onClick={() => router.push("/rooms_v4")} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (error || !room || !gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-amber-300/70 mt-2">{error?.message || "Room not found"}</p>
          <Button onClick={() => router.push("/rooms_v4")} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  const humanPlayer = gameState.players.find((p) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isProcessingAction = isPlayingTurn || isResolvingChancellor || isRespondingGuard || isRespondingBaron || isRespondingPrince || isSubmittingDeck || isStartingNewGame;

  // Waiting for players / deck submission
  if (room.status === GameStatus.WAITING) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-obsidian via-obsidian-deep to-obsidian-deeper flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 px-4 max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-6 w-6 text-amber-400" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              {room.name}
            </h1>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-amber-600/30">
            <p className="text-violet-300/80 text-lg mb-2">
              Players: {room.players.length}/{room.max_players}
            </p>
            <div className="space-y-2">
              {room.players.map((p, idx) => (
                <div key={p.addr} className="flex items-center justify-between text-sm">
                  <span className="text-amber-300">
                    {p.addr === currentAccount.address ? "You" : `Player ${idx + 1}`}
                  </span>
                  <span className="text-green-400">✓ Joined</span>
                </div>
              ))}
            </div>
          </div>

          {!hasSubmittedDeck ? (
            <div className="space-y-4">
              <p className="text-amber-300/70 text-sm">
                Submit your encrypted deck to start the game
              </p>
              <Button
                onClick={handleSubmitDeck}
                disabled={isSubmittingDeck || room.players.length < 2}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500"
              >
                {isSubmittingDeck ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Encrypting & Submitting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Submit Encrypted Deck
                  </>
                )}
              </Button>
              {room.players.length < 2 && (
                <p className="text-yellow-400 text-sm">Waiting for more players to join...</p>
              )}
            </div>
          ) : !allPlayersReady ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Shield className="h-5 w-5" />
                <span>Deck submitted!</span>
              </div>
              <p className="text-amber-300/70 text-sm">
                Waiting for more players to join...
              </p>
              <Loader2 className="h-6 w-6 animate-spin text-amber-400 mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-400">All players ready!</p>
              <p className="text-amber-300/70 text-sm">Game will start automatically...</p>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => router.push("/rooms_v4")}
            className="mt-6 w-full border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
          >
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  // Main game UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 transition-colors duration-500 relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div ref={headerRef} className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400">{room.name}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-300">
            <span>Round {gameState.roundNumber + 1}</span>
            <span>•</span>
            <span>Deck: {room.deck_indices.length}</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push("/rooms_v4")}
            className="text-amber-400 hover:text-amber-300 justify-start"
          >
            Back to Lobby
          </Button>
        </div>

        {/* Decryption status */}
        {isDecrypting && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-800/90 px-3 py-2 rounded-lg border border-amber-600/30">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            <span className="text-sm text-amber-300">Decrypting cards...</span>
          </div>
        )}

        {/* Toggle card values visibility */}
        <div className="absolute top-4 right-4 z-20 mt-12">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCardValues(!showCardValues)}
            className="border-amber-600/50 text-amber-400 hover:bg-amber-600/20"
          >
            {showCardValues ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {showCardValues ? "Hide Values" : "Show Values"}
          </Button>
        </div>

        {/* Game Table */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <GameTable
            playerCount={gameState.players.length}
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            myPlayerIndex={gameState.myPlayerIndex}
            selectedTarget={selectedTarget}
            onSelectTarget={(targetId: number) => setSelectedTarget(targetId)}
            isSelectingTarget={isMyTurn && selectedCard !== null && cardRequiresTarget(selectedCard)}
            selectedCardValue={selectedCard?.value || null}
            opponentCards={Object.fromEntries(
              gameState.players
                .map((p, idx) => [idx, p.hand.length] as [number, number])
                .filter(([idx]) => Number(idx) !== gameState.myPlayerIndex)
            )}
            deckCount={gameState.deckCount}
            discardCount={gameState.discardPile.length}
            discardPile={gameState.discardPile}
            showStartRoundButton={false}
            onStartRound={() => {}}
            isStartingRound={false}
            isGameEnd={gameState.gamePhase === "gameEnd"}
            onStartNewGame={handleStartNewGame}
            winnerName={
              gameState.gamePhase === "gameEnd"
                ? gameState.players.find((p) => p.hearts >= gameState.heartsToWin)?.name || null
                : null
            }
            onViewDiscard={() => setShowDiscardModal(true)}
            roundWinner={roundWinner}
          />
        </div>

        {/* Pending Action Response UI */}
        {needToRespond && pendingAction && (
          <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 z-30">
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg p-4 text-center">
              <AlertTriangle className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <p className="text-orange-300 font-semibold mb-3">
                {pendingAction.action_type === PendingActionType.GUARD_RESPONSE &&
                  `Guard guessed ${CardNames[pendingAction.data[0] ?? 0]}! Reveal your card.`}
                {pendingAction.action_type === PendingActionType.BARON_RESPONSE &&
                  "Baron comparison! Reveal your card."}
                {pendingAction.action_type === PendingActionType.PRINCE_RESPONSE &&
                  "Prince effect! Discard your hand."}
              </p>
              <Button
                onClick={() => {
                  if (pendingAction.action_type === PendingActionType.GUARD_RESPONSE) {
                    handleRespondGuard();
                  } else if (pendingAction.action_type === PendingActionType.BARON_RESPONSE) {
                    handleRespondBaron();
                  } else if (pendingAction.action_type === PendingActionType.PRINCE_RESPONSE) {
                    handleRespondPrince();
                  }
                }}
                disabled={isProcessingAction}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isProcessingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Responding...
                  </>
                ) : (
                  "Reveal Card"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Chancellor Choice UI */}
        {humanPlayer && gameState.gamePhase === "chancellorChoice" && gameState.chancellorCards.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-4 z-30 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-4 backdrop-blur-sm rounded-lg p-4 border border-amber-600/50 bg-slate-900/80">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-amber-400">Chancellor: Choose card to keep</h3>

                {chancellorKeepCard && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setChancellorKeepCard(null);
                        setChancellorReturnOrder([]);
                      }}
                      variant="outline"
                      className="border-amber-600 text-amber-400 hover:bg-amber-600/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleResolveChancellor}
                      disabled={!chancellorKeepCard || isResolvingChancellor}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {isResolvingChancellor ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {!chancellorKeepCard && (
                <div className="flex gap-3 justify-center flex-wrap">
                  {gameState.chancellorCards.map((card) => (
                    <button
                      type="button"
                      key={card.id}
                      onClick={() => {
                        if (card.value >= 0) {
                          setChancellorKeepCard(card);
                          setChancellorReturnOrder(
                            gameState.chancellorCards.filter((c) => c.id !== card.id)
                          );
                        }
                      }}
                      className={cn(
                        "cursor-pointer transition-all hover:scale-105",
                        card.value < 0 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {card.value >= 0 ? (
                        <GameCardComponent card={card} size="small" faceUp />
                      ) : (
                        <div className="w-[100px] h-[150px] bg-slate-700 rounded-lg flex items-center justify-center border-2 border-amber-600/30">
                          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {chancellorKeepCard && (
                <div className="flex gap-6 justify-center">
                  <div className="flex flex-col items-center">
                    <p className="text-amber-300 font-semibold mb-2">Keep:</p>
                    <GameCardComponent card={chancellorKeepCard} size="small" faceUp />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-amber-300 font-semibold mb-2">Return to deck:</p>
                    <div className="flex gap-2">
                      {chancellorReturnOrder.map((card) => (
                        <GameCardComponent key={card.id} card={card} size="small" faceUp />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cards - Display at bottom */}
        {humanPlayer && gameState.gamePhase === "playing" && !needToRespond && (
          <>
            {/* Countess Rule Warning */}
            {mustPlayCountess && isMyTurn && (
              <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-20 animate-pulse">
                <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg border-2 border-red-400">
                  ⚠️ You have Countess with King/Prince - You MUST play Countess!
                </div>
              </div>
            )}

            {/* Cards */}
            <div
              ref={cardsContainerRef}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 justify-center flex-wrap z-10"
            >
              {humanPlayer.hand.map((card) => {
                const isSelected = selectedCardId === card.id;
                const isCountess = card.value === 8;
                const canSelect = isMyTurn && !isProcessingAction && (!mustPlayCountess || isCountess) && card.value >= 0;

                return (
                  <div
                    key={card.id}
                    className={cn(
                      "game-card-item transition-all",
                      mustPlayCountess && !isCountess && "grayscale",
                      card.value < 0 && "opacity-70"
                    )}
                  >
                    {card.value >= 0 ? (
                      <GameCardComponent
                        card={card}
                        size="small"
                        faceUp={showCardValues}
                        selected={isSelected}
                        disabled={!canSelect}
                        onClick={() => {
                          if (!canSelect) return;
                          const newSelectedId = isSelected ? null : card.id;
                          setSelectedCardId(newSelectedId);
                          if (!newSelectedId) {
                            setSelectedTarget(null);
                            setSelectedGuess(null);
                          }
                        }}
                      />
                    ) : (
                      <div className="w-[100px] h-[150px] bg-slate-700 rounded-lg flex flex-col items-center justify-center border-2 border-amber-600/30 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
                        <span className="text-xs text-amber-400">Decrypting...</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Card description and PLAY Button */}
            {selectedCard && selectedCard.value >= 0 && (
              <div className="absolute bottom-4 left-1/2 translate-x-[160px] h-[200px] flex flex-col justify-between items-start z-20">
                {isMyTurn && (
                  (() => {
                    const requiresTarget = cardRequiresTarget(selectedCard);
                    const requiresGuess = cardRequiresGuess(selectedCard);
                    const validTargets = getValidTargets();
                    const hasValidTargets = validTargets.length > 0;
                    const canTargetSelf = selectedCard.value === 5;

                    let isDisabled = isProcessingAction;

                    if (requiresTarget) {
                      if (selectedTarget === null) {
                        if (hasValidTargets || canTargetSelf) {
                          isDisabled = true;
                        }
                      } else if (requiresGuess) {
                        isDisabled = selectedGuess === null;
                      }
                    }

                    return (
                      <Button
                        ref={playButtonRef}
                        onClick={handlePlayCard}
                        disabled={isDisabled}
                        className="relative overflow-hidden bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-8 text-lg rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_#92400e,0_6px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_2px_0_0_#92400e,0_4px_15px_rgba(245,158,11,0.5)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none border-2 border-amber-400/50"
                        style={{ fontFamily: "var(--font-god-of-war), serif" }}
                      >
                        <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
                          {isProcessingAction ? "⚔️ Playing..." : "⚔️ PLAY"}
                        </span>
                      </Button>
                    );
                  })()
                )}

                <div className="text-sm text-amber-300 bg-slate-900/90 px-2 py-1 rounded border border-amber-600/50 max-w-[220px] whitespace-normal">
                  {selectedCard.description}
                </div>
              </div>
            )}

            {/* Guess Selection (Guard) */}
            {isMyTurn && selectedCard?.value === 1 && selectedTarget !== null && (
              <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 z-10">
                <p className="text-amber-300 text-sm mb-2 text-center">Guess a card (not Guard):</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {[0, 2, 3, 4, 5, 6, 7, 8, 9].map((cardValue) => {
                    const cardData = CARD_DATA_MAP[cardValue];
                    if (!cardData) return null;
                    return (
                      <button
                        key={cardValue}
                        type="button"
                        onClick={() => setSelectedGuess(selectedGuess === cardValue ? null : cardValue)}
                        className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                          selectedGuess === cardValue
                            ? "border-amber-400 bg-amber-400/20 text-amber-300"
                            : "border-amber-600/50 hover:border-amber-400 text-amber-400"
                        }`}
                      >
                        {cardData.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Waiting for turn */}
            {!isMyTurn && humanPlayer && !humanPlayer.isEliminated && (
              <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-10">
                <div className="bg-slate-800/90 px-4 py-2 rounded-lg border border-amber-600/30">
                  <p className="text-amber-300">
                    Waiting for {currentPlayer?.name || "opponent"} to play...
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Game Log */}
        {room.discarded_cards_log.length > 0 && (
          <div className="absolute bottom-4 right-4 z-20 w-64">
            <div className="bg-slate-800/90 rounded-lg p-3 border border-amber-600/30 max-h-40 overflow-y-auto">
              <h4 className="text-xs font-semibold text-amber-400 mb-2">Game Log</h4>
              <div className="space-y-1">
                {room.discarded_cards_log.slice(-5).map((entry, idx) => (
                  <div key={`log-${idx}-${entry.card_index}`} className="text-xs text-amber-300/70">
                    <span className="text-slate-500">T{Number(entry.turn_number) + 1}:</span>{" "}
                    {entry.player_addr.slice(0, 6)}... played {CardNames[entry.card_value]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discard Pile Modal */}
        {showDiscardModal && (
          <button
            type="button"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowDiscardModal(false)}
          >
            <button
              type="button"
              className="bg-slate-900 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto border border-amber-600/50 cursor-default text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">
                Discarded Cards ({gameState.discardPile.length})
              </h3>
              <div className="flex flex-wrap gap-4 justify-center">
                {gameState.discardPile.map((card) => (
                  <div key={card.id} className="flex flex-col items-center gap-1">
                    <CardCharacter cardType={mapCardValueToCardType(card.value)} size="xs" />
                    <span className="text-xs text-amber-400">{card.name}</span>
                  </div>
                ))}
              </div>
              {gameState.discardPile.length === 0 && (
                <p className="text-center text-amber-400/70">No cards discarded yet</p>
              )}
              <p className="text-center text-amber-400/50 text-xs mt-4">Click anywhere to close</p>
            </button>
          </button>
        )}

        {/* Result Notification */}
        {resultNotification && (
          <div className="fixed top-4 right-4 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg max-w-sm">
            <h3 className="font-bold">{resultNotification.title}</h3>
            <p className="text-sm">{resultNotification.message}</p>
            <button
              type="button"
              onClick={() => setResultNotification(null)}
              className="mt-2 text-xs underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
