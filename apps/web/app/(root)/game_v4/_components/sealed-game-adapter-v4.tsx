"use client";

import type { GameCard, Player } from "@/components/game/game-context";
import { Button } from "@/components/ui/button";
import { GameTable } from "@/components/game-table";
import { GameCardComponent } from "@/components/game/game-card";
import { CardCharacter } from "@/components/common/game-ui/cards/card-character";
import { CardType as CardConceptCardType, CardConceptType, cardsMap, CardType } from "@/components/common/game-ui/cards/types";
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
import { Loader2, Lock, Shield, Eye, EyeOff } from "lucide-react";

// Card data mapping for game components - Relic of Lies theme
const CARD_DATA_MAP: Record<number, Omit<GameCard, "id">> = {
  0: { type: "spy", name: "Scout", value: 0, description: "At round end, if only you played or discarded a Scout, gain 1 Relic.", count: 2 },
  1: { type: "guard", name: "Knight", value: 1, description: "Name a non-Knight card. If that target holds it, they are eliminated.", count: 6 },
  2: { type: "priest", name: "Healer", value: 2, description: "Choose and privately look at another player's hand.", count: 2 },
  3: { type: "baron", name: "Berserker", value: 3, description: "Compare hands with another player. Lower card is eliminated.", count: 2 },
  4: { type: "handmaid", name: "Cleric", value: 4, description: "You are immune to all card effects until your next turn.", count: 2 },
  5: { type: "prince", name: "Wizard", value: 5, description: "Choose any player. They discard their card and draw a new one.", count: 2 },
  6: { type: "chancellor", name: "Tactician", value: 6, description: "Draw 2 cards. Keep one and place the others at bottom in any order.", count: 2 },
  7: { type: "king", name: "Paladin", value: 7, description: "Choose and swap your hand with another player's hand.", count: 1 },
  8: { type: "countess", name: "Cursed Idol", value: 8, description: "Must be discarded if held with Wizard or Paladin. Otherwise, no effect.", count: 1 },
  9: { type: "princess", name: "Sacred Crystal", value: 9, description: "If you play or discard this card, you are immediately eliminated.", count: 1 },
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
      name: idx === myPlayerIndex ? "You" : `${p.addr.slice(0, 6)}...${p.addr.slice(-4)}`,
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

  // Discard pile from discarded_cards_log (more reliable source)
  const discardPile: GameCard[] = room.discarded_cards_log.map((entry, idx) => 
    createCard(entry.card_value, `discard-log-${idx}-turn-${entry.turn_number}`)
  );

  // Check if any player has won the game (reached tokens_to_win)
  const gameWinner = room.players.find((p) => p.tokens >= room.tokens_to_win);
  
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
    // If someone has won, treat as game end
    gamePhase = gameWinner ? "gameEnd" : "roundEnd";
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
  
  // Healer reveal state
  const [healerRevealedCard, setHealerRevealedCard] = useState<{
    cardIndex: number;
    cardValue: number;
    targetPlayerIndex: number;
    targetPlayerName: string;
    expiresTurn: number;
  } | null>(null);
  const [showHealerModal, setShowHealerModal] = useState(false);

  // Healer reveal state
  const [revealedCard, setRevealedCard] = useState<{ card: GameCard; targetName: string; targetAddress: string } | null>(null);
  const lastHealerPlayRef = useRef<{ targetIndex: number; timestamp: number } | null>(null);
  
  // Berserker comparison state
  const [berserkerComparison, setBerserkerComparison] = useState<{
    myCard: GameCard;
    myAddress: string;
    opponentCard: GameCard;
    opponentAddress: string;
    result: 'win' | 'lose' | 'tie';
    myPlayerIndex: number;
    targetPlayerIndex: number;
  } | null>(null);
  const lastBerserkerPlayRef = useRef<{ targetIndex: number; myCardValue: number; timestamp: number } | null>(null);
  const [berserkerAnimationComplete, setBerserkerAnimationComplete] = useState(false);

  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const turnIndicatorRef = useRef<HTMLDivElement>(null);
  const prevHandLength = useRef<number>(0);
  const prevHandCardsRef = useRef<GameCard[]>([]);
  const prevRoundRef = useRef<number>(0);
  
  // Flag to skip animation on initial page load
  const isInitialLoadRef = useRef<boolean>(true);
  
  // Draw card animation state
  const [drawCardAnimation, setDrawCardAnimation] = useState<{
    drawnCards: GameCard[];
    isRoundStart: boolean;
  } | null>(null);
  
  // State to hide newly drawn cards until animation completes
  const [hiddenDrawnCards, setHiddenDrawnCards] = useState<Set<string>>(new Set());
  
  // Track processed card IDs to prevent duplicate animations
  const processedCardIdsRef = useRef<Set<string>>(new Set());
  const prevRoundForDiscardRef = useRef<number>(0);
  const isFirstLoadForDiscardRef = useRef<boolean>(true);
  const isAnimatingThrownCardRef = useRef<boolean>(false);
  
  // Animation state - track card being thrown to table (visible to all players)
  const [thrownCardAnimation, setThrownCardAnimation] = useState<{
    cardValue: number;
    playerIndex: number;
    playerName: string;
    cardId: string;
  } | null>(null);
  
  // State to hide newly added cards from discard pile until animation completes
  const [hiddenDiscardCards, setHiddenDiscardCards] = useState<Set<string>>(new Set());
  
  // Wizard (card 5) special animation state
  const [wizardEffectAnimation, setWizardEffectAnimation] = useState<{
    targetPlayerIndex: number;
    targetPlayerName: string;
    discardedCardValue: number;
    discardedCardId: string;
  } | null>(null);
  
  // Track pending wizard effect
  const pendingWizardRef = useRef<{
    wizardPlayerIndex: number;
    timestamp: number;
  } | null>(null);

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
      setHealerRevealedCard(null);
    }
  }, [room?.round_number, room?.status]);

  // Track Healer temporary access - decrypt opponent's card when we have access
  const healerAccessRef = useRef<string>("");
  useEffect(() => {
    if (!room || !currentAccount?.address) return;

    // Find temporary access granted to current player
    const myAccess = room.seal_access.temporary_access.find(
      (access) => 
        access.viewer === currentAccount.address && 
        Number(access.expires_turn) > Number(room.current_turn)
    );

    if (!myAccess) {
      // Clear priest reveal if access expired
      if (healerRevealedCard && Number(room.current_turn) >= healerRevealedCard.expiresTurn) {
        setHealerRevealedCard(null);
      }
      return;
    }

    const accessKey = `${myAccess.card_index}-${myAccess.expires_turn}`;
    if (accessKey === healerAccessRef.current) {
      return; // Already processed this access
    }

    // Find which player owns this card
    const cardOwner = room.seal_access.card_owners.find(
      (owner) => Number(owner.card_index) === Number(myAccess.card_index)
    );
    
    if (!cardOwner) return;

    const targetPlayerIndex = room.players.findIndex(
      (p) => p.addr === cardOwner.owner
    );
    
    if (targetPlayerIndex < 0) return;

    // Decrypt the target's card
    const doDecryptHealerCard = async () => {
      try {
        const encryptedCards = room.encrypted_cards.map((card) => {
          if ("Encrypted" in card && card.Encrypted) {
            return { ciphertext: new Uint8Array(card.Encrypted.ciphertext) };
          } else if ("Decrypted" in card && card.Decrypted) {
            return { ciphertext: new Uint8Array(card.Decrypted.data) };
          }
          return { ciphertext: new Uint8Array() };
        });

        const cardIndex = Number(myAccess.card_index);
        console.log("Healer: Decrypting opponent's card at index:", cardIndex);
        
        const decrypted = await decryptCards(roomId, [cardIndex], encryptedCards);
        
        const firstDecrypted = decrypted[0];
        if (decrypted.length > 0 && firstDecrypted && firstDecrypted.value >= 0) {
          setHealerRevealedCard({
            cardIndex: cardIndex,
            cardValue: firstDecrypted.value,
            targetPlayerIndex: targetPlayerIndex,
            targetPlayerName: `Player ${targetPlayerIndex + 1}`,
            expiresTurn: Number(myAccess.expires_turn),
          });
          setShowHealerModal(true);
          healerAccessRef.current = accessKey;
        }
      } catch (err) {
        console.error("Failed to decrypt Healer target card:", err);
      }
    };

    doDecryptHealerCard();
  }, [room, currentAccount?.address, roomId, decryptCards, healerRevealedCard]);

  // Convert room to game state
  const gameState = useMemo(() => {
    if (!room || !currentAccount?.address) return null;
    return convertRoomToGameState(room, currentAccount.address, decryptedCards);
  }, [room, currentAccount, decryptedCards]);

  // Get human player (always available after gameState is computed)
  const humanPlayer = useMemo(() => {
    if (!gameState) return null;
    return gameState.players.find((p) => !p.isBot) || null;
  }, [gameState]);

  // Get selected card object
  const selectedCard = useMemo(() => {
    if (!selectedCardId || !gameState) return null;
    const humanPlayer = gameState.players.find((p) => !p.isBot);
    return humanPlayer?.hand.find((c) => c.id === selectedCardId) || null;
  }, [selectedCardId, gameState]);

  // Check Cursed Idol rule
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

      // Track Healer and Berserker plays for reveal modals
      const isHealer = cardValue === 2;
      const isBerserker = cardValue === 3;
      const targetIndex = targetToUse;
      
      // For Berserker, store my card value before playing (the other card in hand, not the Berserker)
      const myCardForBerserker = isBerserker && humanPlayer ? 
        humanPlayer.hand.find((c: GameCard) => c.id !== selectedCardId && c.value >= 0) : null;

      // playTurn signature: (roomId, cardIndex, cardValue, targetIdx?, guess?)
      await playTurn(
        roomId,
        cardIndex,
        cardValue,
        targetToUse,
        selectedGuess
      );

      // If Healer was played, store target info to reveal after room update
      if (isHealer && targetIndex !== null && targetIndex >= 0) {
        lastHealerPlayRef.current = {
          targetIndex,
          timestamp: Date.now()
        };
      }
      
      // If Berserker was played, store info to show comparison after room update
      if (isBerserker && targetIndex !== null && targetIndex >= 0 && myCardForBerserker) {
        lastBerserkerPlayRef.current = {
          targetIndex,
          myCardValue: myCardForBerserker.value,
          timestamp: Date.now()
        };
      }

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

  // Track if we're currently auto-responding to prevent duplicate calls
  const isAutoRespondingRef = useRef(false);
  const lastPendingActionRef = useRef<string>("");

  // Auto-respond to pending actions when we have the decrypted card
  useEffect(() => {
    if (!needToRespond || !pendingAction || myHandIndices.length === 0) return;
    if (isAutoRespondingRef.current) return;
    
    const cardIndex = myHandIndices[0];
    if (cardIndex === undefined) return;
    
    const decrypted = decryptedCards.find((dc) => dc.cardIndex === cardIndex);
    if (!decrypted || decrypted.value < 0) return;

    // Create a unique key for this pending action to prevent duplicate responses
    const actionKey = `${pendingAction.action_type}-${pendingAction.card_index}-${room?.current_turn}`;
    if (actionKey === lastPendingActionRef.current) return;

    const doAutoRespond = async () => {
      isAutoRespondingRef.current = true;
      lastPendingActionRef.current = actionKey;

      try {
        console.log("Auto-responding to pending action:", pendingAction.action_type);
        
        if (pendingAction.action_type === PendingActionType.GUARD_RESPONSE) {
          await respondGuard(roomId, cardIndex, decrypted.value);
        } else if (pendingAction.action_type === PendingActionType.BARON_RESPONSE) {
          await respondBaron(roomId, cardIndex, decrypted.value);
        } else if (pendingAction.action_type === PendingActionType.PRINCE_RESPONSE) {
          await respondPrince(roomId, cardIndex, decrypted.value);
        }
        
        fetchRoom();
      } catch (err) {
        console.error("Auto-respond failed:", err);
        setResultNotification({
          type: "failure",
          title: "Failed to Respond",
          message: err instanceof Error ? err.message : "Unknown error",
        });
        // Reset so user can try again manually if needed
        lastPendingActionRef.current = "";
      } finally {
        isAutoRespondingRef.current = false;
      }
    };

    doAutoRespond();
  }, [needToRespond, pendingAction, myHandIndices, decryptedCards, roomId, respondGuard, respondBaron, respondPrince, fetchRoom, room?.current_turn]);

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
        title: "Failed to Resolve Tactician",
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

  // Auto-select Cursed Idol
  useEffect(() => {
    if (mustPlayCountess && countessCard && isMyTurn && !selectedCardId) {
      setSelectedCardId(countessCard.id);
    }
  }, [mustPlayCountess, countessCard, isMyTurn, selectedCardId]);

  // Monitor for Healer reveal after room updates
  useEffect(() => {
    if (!room || !gameState || !lastHealerPlayRef.current) return;
    
    const { targetIndex, timestamp } = lastHealerPlayRef.current;
    
    if (Date.now() - timestamp > 10000) {
      lastHealerPlayRef.current = null;
      return;
    }
    
    const targetPlayer = gameState.players[targetIndex];
    if (targetPlayer && targetPlayer.hand.length > 0) {
      const targetCard = targetPlayer.hand[0];
      // In V4, we need to check if we can see the card (decrypted via response)
      if (targetCard && targetCard.value >= 0) {
        setRevealedCard({
          card: targetCard,
          targetName: targetPlayer.name,
          targetAddress: targetPlayer.id
        });
        
        lastHealerPlayRef.current = null;
        
        setTimeout(() => {
          setRevealedCard(null);
        }, 10000);
      }
    }
  }, [room, gameState]);

  // Monitor for Berserker comparison after room updates
  useEffect(() => {
    if (!room || !gameState || !lastBerserkerPlayRef.current || !humanPlayer) return;
    
    const { targetIndex, myCardValue, timestamp } = lastBerserkerPlayRef.current;
    
    if (Date.now() - timestamp > 10000) {
      lastBerserkerPlayRef.current = null;
      return;
    }
    
    const targetPlayer = gameState.players[targetIndex];
    const myPlayer = gameState.players[gameState.myPlayerIndex];
    
    if (targetPlayer) {
      let opponentCardValue: number;
      
      if (targetPlayer.hand.length > 0 && targetPlayer.hand[0]?.value !== undefined && targetPlayer.hand[0].value >= 0) {
        opponentCardValue = targetPlayer.hand[0].value;
      } else if (targetPlayer.isEliminated) {
        if (!myPlayer?.isEliminated) {
          opponentCardValue = myCardValue - 1;
        } else {
          opponentCardValue = myCardValue;
        }
      } else {
        lastBerserkerPlayRef.current = null;
        return;
      }
      
      let result: 'win' | 'lose' | 'tie';
      if (myCardValue > opponentCardValue) {
        result = 'win';
      } else if (myCardValue < opponentCardValue) {
        result = 'lose';
      } else {
        result = 'tie';
      }
      
      // Reset animation state before showing comparison
      setBerserkerAnimationComplete(false);
      
      setBerserkerComparison({
        myCard: createCard(myCardValue, 'my-baron-card'),
        myAddress: myPlayer?.id || '',
        opponentCard: createCard(opponentCardValue, 'opponent-baron-card'),
        opponentAddress: targetPlayer.id,
        result,
        myPlayerIndex: gameState.myPlayerIndex,
        targetPlayerIndex: targetIndex,
      });
      
      lastBerserkerPlayRef.current = null;
      
      // Auto-hide modal after 10 seconds (after animation completes)
      setTimeout(() => {
        setBerserkerComparison(null);
        setBerserkerAnimationComplete(false);
      }, 12000); // 10 seconds after animation + 2 seconds for animation itself
    }
  }, [room, gameState, humanPlayer]);

  // Detect when new cards are drawn and trigger animation
  useEffect(() => {
    if (!humanPlayer) return;
    
    const currentHand = humanPlayer.hand.filter((c: GameCard) => c.value >= 0); // Only consider decrypted cards
    const prevHand = prevHandCardsRef.current;
    const currentHandLength = currentHand.length;
    
    // Skip animation on initial page load
    if (isInitialLoadRef.current) {
      prevHandLength.current = currentHandLength;
      prevHandCardsRef.current = [...currentHand];
      isInitialLoadRef.current = false;
      return;
    }
    
    // Check if cards were drawn (hand grew)
    if (currentHandLength > prevHandLength.current) {
      const prevIds = new Set(prevHand.map((c: GameCard) => c.id));
      const newCards = currentHand.filter((c: GameCard) => !prevIds.has(c.id));
      
      if (newCards.length > 0) {
        const isRoundStart = prevHandLength.current === 0;
        
        // Hide new cards until animation completes
        setHiddenDrawnCards(prev => {
          const newSet = new Set(prev);
          for (const c of newCards) {
            newSet.add(c.id);
          }
          return newSet;
        });
        
        setDrawCardAnimation({
          drawnCards: newCards,
          isRoundStart,
        });
      }
    }
    
    prevHandLength.current = currentHandLength;
    prevHandCardsRef.current = [...currentHand];
  }, [humanPlayer?.hand, humanPlayer]);

  // Detect when any player plays a card (using discarded_cards_log for reliable tracking)
  useEffect(() => {
    if (!gameState || !room) return;
    
    const log = room.discarded_cards_log;
    
    // On first load, mark all existing entries as processed (no animation)
    if (isFirstLoadForDiscardRef.current) {
      isFirstLoadForDiscardRef.current = false;
      prevRoundForDiscardRef.current = gameState.roundNumber;
      // Mark all existing entries as processed
      for (let i = 0; i < log.length; i++) {
        const entry = log[i];
        if (entry) {
          processedCardIdsRef.current.add(`discard-log-${i}-turn-${entry.turn_number}`);
        }
      }
      return;
    }
    
    // Reset tracking on round change
    if (gameState.roundNumber !== prevRoundForDiscardRef.current) {
      processedCardIdsRef.current = new Set();
      prevRoundForDiscardRef.current = gameState.roundNumber;
      setHiddenDiscardCards(new Set());
      pendingWizardRef.current = null;
      // Mark all existing entries as processed for new round
      for (let i = 0; i < log.length; i++) {
        const entry = log[i];
        if (entry) {
          processedCardIdsRef.current.add(`discard-log-${i}-turn-${entry.turn_number}`);
        }
      }
      return;
    }
    
    // Process each log entry that hasn't been processed yet
    for (let logIndex = 0; logIndex < log.length; logIndex++) {
      const entry = log[logIndex];
      if (!entry) continue;
      
      const cardId = `discard-log-${logIndex}-turn-${entry.turn_number}`;
      
      // Skip if already processed
      if (processedCardIdsRef.current.has(cardId)) continue;
      
      // Mark as processed immediately to prevent duplicates
      processedCardIdsRef.current.add(cardId);
      
      const cardValue = entry.card_value;
      
      // Find player index by address
      let playerWhoPlayed = room.players.findIndex(p => p.addr === entry.player_addr);
      let playerName = '';
      
      if (playerWhoPlayed >= 0) {
        const player = gameState.players[playerWhoPlayed];
        playerName = player?.name || `${entry.player_addr.slice(0, 6)}...${entry.player_addr.slice(-4)}`;
      } else {
        playerName = `${entry.player_addr.slice(0, 6)}...${entry.player_addr.slice(-4)}`;
        playerWhoPlayed = 0;
      }
      
      // Hide this card until animation completes
      setHiddenDiscardCards(prev => new Set(prev).add(cardId));
      
      // Trigger card animation
      setThrownCardAnimation({
        cardValue,
        playerIndex: playerWhoPlayed,
        playerName,
        cardId,
      });
      
      // Check for Wizard (5) effect - look for next entry that might be the target's forced discard
      if (cardValue === 5 && logIndex + 1 < log.length) {
        const nextEntry = log[logIndex + 1];
        const nextCardId = `discard-log-${logIndex + 1}-turn-${nextEntry?.turn_number}`;
        
        // If next entry is from a different player, it's the Wizard target
        if (nextEntry && nextEntry.player_addr !== entry.player_addr && !processedCardIdsRef.current.has(nextCardId)) {
          // Mark next entry as processed too
          processedCardIdsRef.current.add(nextCardId);
          
          const targetPlayerIndex = room.players.findIndex(p => p.addr === nextEntry.player_addr);
          const targetPlayer = gameState.players[targetPlayerIndex];
          const targetPlayerName = targetPlayer?.name === 'You' ? 'You' : (targetPlayer?.name || `${nextEntry.player_addr.slice(0, 6)}...${nextEntry.player_addr.slice(-4)}`);
          
          setHiddenDiscardCards(prev => new Set(prev).add(nextCardId));
          
          setTimeout(() => {
            setWizardEffectAnimation({
              targetPlayerIndex: targetPlayerIndex >= 0 ? targetPlayerIndex : 0,
              targetPlayerName,
              discardedCardValue: nextEntry.card_value,
              discardedCardId: nextCardId,
            });
          }, 1200);
        } else {
          // Set pending wizard to catch target's discard later
          pendingWizardRef.current = {
            wizardPlayerIndex: playerWhoPlayed,
            timestamp: Date.now(),
          };
        }
      }
      
      // Check for pending wizard (Wizard was played earlier, now target discards)
      if (pendingWizardRef.current && cardValue !== 5) {
        const pendingWizard = pendingWizardRef.current;
        if (Date.now() - pendingWizard.timestamp < 5000 && playerWhoPlayed !== pendingWizard.wizardPlayerIndex) {
          const targetPlayer = gameState.players[playerWhoPlayed];
          const targetPlayerName = targetPlayer?.name === 'You' ? 'You' : (targetPlayer?.name || playerName);
          
          setTimeout(() => {
            setWizardEffectAnimation({
              targetPlayerIndex: playerWhoPlayed,
              targetPlayerName,
              discardedCardValue: cardValue,
              discardedCardId: cardId,
            });
          }, 200);
          
          pendingWizardRef.current = null;
        }
      }
    }
  }, [gameState, room]);

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

  // GSAP: Card thrown to table animation - visible to all players
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally not including gameState to prevent re-triggering animation
  useLayoutEffect(() => {
    if (!thrownCardAnimation || !gameState) return;
    
    // Prevent duplicate animations
    if (isAnimatingThrownCardRef.current) return;
    isAnimatingThrownCardRef.current = true;
    
    const { cardValue, playerIndex, playerName, cardId } = thrownCardAnimation;
    const isMyCard = playerIndex === gameState.myPlayerIndex;
    
    // Get card data from cardsMap
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    const cardTypeKey = `Value${cardValue}` as CardType;
    const cardInfo = cardConcept.cards[cardTypeKey];
    
    if (!cardInfo) {
      console.warn(`Card type ${cardTypeKey} not found`);
      setThrownCardAnimation(null);
      return;
    }
    
    const cardHeight = 200;
    const cardWidth = Math.round((cardHeight * 2) / 3);
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize);
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize);
    const descriptionFontSize = Math.round(cardHeight * cardConcept.descriptionFontSize);
    
    // Create animated card element
    const animatedCard = document.createElement('div');
    animatedCard.className = 'fixed z-[100] pointer-events-none';
    animatedCard.id = 'thrown-card-animation';
    
    animatedCard.innerHTML = `
      <div class="flex flex-col items-center gap-2">
        <div class="relative rounded-lg overflow-hidden shadow-2xl" style="width: ${cardWidth}px; height: ${cardHeight}px; box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);">
          <img src="${cardInfo.image}" alt="${cardInfo.name}" class="absolute inset-0 w-full h-full object-contain z-0" />
          <img src="${cardConcept.frame}" alt="Frame" class="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
          <span class="absolute z-20 drop-shadow-lg" style="color: #d2ac77; top: 1.8%; left: 10.5%; font-size: ${valueFontSize}px; font-family: var(--font-faith-collapsing), serif; font-weight: bold;">${cardInfo.value}</span>
          <span class="absolute z-20 truncate" style="color: #402716; top: 3.3%; left: 60%; transform: translateX(-50%); font-size: ${nameFontSize}px; font-family: var(--font-god-of-war), serif; max-width: 70%; font-weight: bold;">${cardInfo.name}</span>
          <p class="absolute z-20 text-center" style="color: rgba(0, 0, 0, 0.8); bottom: 10%; left: 50%; transform: translateX(-50%); font-size: ${descriptionFontSize}px; font-family: var(--font-helvetica), sans-serif; width: 72%; font-weight: 600; line-height: 1.2;">${cardInfo.description}</p>
        </div>
        <div class="bg-slate-900/90 px-3 py-1.5 rounded-full border border-amber-500/50 shadow-lg">
          <span class="text-sm font-medium text-amber-400">${isMyCard ? 'You' : playerName}</span>
        </div>
      </div>
    `;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let startX: number;
    let startY: number;
    
    const totalPlayers = gameState.players.length;
    const opponentCount = totalPlayers - 1;
    
    if (isMyCard) {
      startX = viewportWidth / 2;
      startY = viewportHeight - 100;
    } else {
      const opponentIdx = playerIndex > gameState.myPlayerIndex 
        ? playerIndex - gameState.myPlayerIndex - 1 
        : playerIndex + (totalPlayers - gameState.myPlayerIndex - 1);
      
      if (opponentCount === 1) {
        startX = viewportWidth / 2;
        startY = 100;
      } else if (opponentCount === 2) {
        if (opponentIdx === 0) {
          startX = 100;
          startY = viewportHeight / 2;
        } else {
          startX = viewportWidth - 100;
          startY = viewportHeight / 2;
        }
      } else {
        if (opponentIdx === 0) {
          startX = 100;
          startY = viewportHeight / 2;
        } else if (opponentIdx === 1) {
          startX = viewportWidth / 2;
          startY = 100;
        } else {
          startX = viewportWidth - 100;
          startY = viewportHeight / 2;
        }
      }
    }
    
    const targetX = viewportWidth / 2;
    const targetY = viewportHeight * 0.4;
    
    animatedCard.style.left = `${startX}px`;
    animatedCard.style.top = `${startY}px`;
    animatedCard.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(-15deg)';
    animatedCard.style.opacity = '0';
    
    document.body.appendChild(animatedCard);
    
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(animatedCard, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          delay: 0.6,
          ease: "power2.in",
          onComplete: () => {
            animatedCard.remove();
            setHiddenDiscardCards(prev => {
              const newSet = new Set(prev);
              newSet.delete(cardId);
              return newSet;
            });
            isAnimatingThrownCardRef.current = false;
            setThrownCardAnimation(null);
          },
        });
      },
    });
    
    tl.to(animatedCard, { opacity: 1, scale: 0.8, rotation: -5, duration: 0.2, ease: "power2.out" });
    tl.to(animatedCard, { left: targetX, top: targetY, scale: 1, rotation: gsap.utils.random(-10, 10), duration: 0.5, ease: "power2.out" });
    tl.to(animatedCard, { scale: 1.1, duration: 0.1, ease: "power2.out" });
    tl.to(animatedCard, { scale: 1, duration: 0.15, ease: "bounce.out" });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thrownCardAnimation]);

  // GSAP: Berserker (Baron) comparison animation - 2 cards fly in and compare
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally not including gameState to prevent re-triggering animation
  useLayoutEffect(() => {
    if (!berserkerComparison || !gameState || berserkerAnimationComplete) return;
    
    const { myCard, opponentCard, myPlayerIndex, targetPlayerIndex, result } = berserkerComparison;
    
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight * 0.4;
    
    const cardHeight = 200;
    const cardWidth = Math.round((cardHeight * 2) / 3);
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize);
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize);
    const descriptionFontSize = Math.round(cardHeight * cardConcept.descriptionFontSize);
    
    const myCardTypeKey = `Value${myCard.value}` as CardType;
    const opponentCardTypeKey = `Value${opponentCard.value}` as CardType;
    const myCardInfo = cardConcept.cards[myCardTypeKey];
    const opponentCardInfo = cardConcept.cards[opponentCardTypeKey];
    
    if (!myCardInfo || !opponentCardInfo) {
      setBerserkerAnimationComplete(true);
      return;
    }
    
    const totalPlayers = gameState.players.length;
    const opponentCount = totalPlayers - 1;
    
    const myX = viewportWidth / 2;
    const myY = viewportHeight - 100;
    
    let opponentX: number;
    let opponentY: number;
    
    if (targetPlayerIndex > myPlayerIndex) {
      const opponentIdx = targetPlayerIndex - myPlayerIndex - 1;
      if (opponentCount === 1) {
        opponentX = viewportWidth / 2;
        opponentY = 100;
      } else if (opponentCount === 2) {
        opponentX = opponentIdx === 0 ? 100 : viewportWidth - 100;
        opponentY = viewportHeight / 2;
      } else {
        if (opponentIdx === 0) { opponentX = 100; opponentY = viewportHeight / 2; }
        else if (opponentIdx === 1) { opponentX = viewportWidth / 2; opponentY = 100; }
        else { opponentX = viewportWidth - 100; opponentY = viewportHeight / 2; }
      }
    } else {
      const opponentIdx = targetPlayerIndex + (totalPlayers - myPlayerIndex - 1);
      if (opponentCount === 1) {
        opponentX = viewportWidth / 2;
        opponentY = 100;
      } else if (opponentCount === 2) {
        opponentX = opponentIdx === 0 ? 100 : viewportWidth - 100;
        opponentY = viewportHeight / 2;
      } else {
        if (opponentIdx === 0) { opponentX = 100; opponentY = viewportHeight / 2; }
        else if (opponentIdx === 1) { opponentX = viewportWidth / 2; opponentY = 100; }
        else { opponentX = viewportWidth - 100; opponentY = viewportHeight / 2; }
      }
    }
    
    const myCardEl = document.createElement('div');
    myCardEl.className = 'fixed z-[100] pointer-events-none';
    myCardEl.innerHTML = `
      <div class="relative rounded-lg overflow-hidden shadow-2xl" style="width: ${cardWidth}px; height: ${cardHeight}px; box-shadow: 0 0 30px ${result === 'win' ? 'rgba(34, 197, 94, 0.6)' : result === 'lose' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'};">
        <img src="${myCardInfo.image}" alt="${myCardInfo.name}" class="absolute inset-0 w-full h-full object-contain z-0" />
        <img src="${cardConcept.frame}" alt="Frame" class="absolute inset-0 w-full h-full object-cover z-10" />
        <span class="absolute z-20 drop-shadow-lg" style="color: #d2ac77; top: 1.8%; left: 10.5%; font-size: ${valueFontSize}px; font-family: var(--font-faith-collapsing), serif; font-weight: bold;">${myCardInfo.value}</span>
        <span class="absolute z-20 truncate" style="color: #402716; top: 3.3%; left: 60%; transform: translateX(-50%); font-size: ${nameFontSize}px; font-family: var(--font-god-of-war), serif; max-width: 70%; font-weight: bold;">${myCardInfo.name}</span>
        <p class="absolute z-20 text-center" style="color: rgba(0, 0, 0, 0.8); bottom: 10%; left: 50%; transform: translateX(-50%); font-size: ${descriptionFontSize}px; font-family: var(--font-helvetica), sans-serif; width: 72%; font-weight: 600; line-height: 1.2;">${myCardInfo.description}</p>
      </div>
    `;
    
    const opponentCardEl = document.createElement('div');
    opponentCardEl.className = 'fixed z-[100] pointer-events-none';
    opponentCardEl.innerHTML = `
      <div class="relative rounded-lg overflow-hidden shadow-2xl" style="width: ${cardWidth}px; height: ${cardHeight}px; box-shadow: 0 0 30px ${result === 'lose' ? 'rgba(34, 197, 94, 0.6)' : result === 'win' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'};">
        <img src="${opponentCardInfo.image}" alt="${opponentCardInfo.name}" class="absolute inset-0 w-full h-full object-contain z-0" />
        <img src="${cardConcept.frame}" alt="Frame" class="absolute inset-0 w-full h-full object-cover z-10" />
        <span class="absolute z-20 drop-shadow-lg" style="color: #d2ac77; top: 1.8%; left: 10.5%; font-size: ${valueFontSize}px; font-family: var(--font-faith-collapsing), serif; font-weight: bold;">${opponentCardInfo.value}</span>
        <span class="absolute z-20 truncate" style="color: #402716; top: 3.3%; left: 60%; transform: translateX(-50%); font-size: ${nameFontSize}px; font-family: var(--font-god-of-war), serif; max-width: 70%; font-weight: bold;">${opponentCardInfo.name}</span>
        <p class="absolute z-20 text-center" style="color: rgba(0, 0, 0, 0.8); bottom: 10%; left: 50%; transform: translateX(-50%); font-size: ${descriptionFontSize}px; font-family: var(--font-helvetica), sans-serif; width: 72%; font-weight: 600; line-height: 1.2;">${opponentCardInfo.description}</p>
      </div>
    `;
    
    myCardEl.style.left = `${myX}px`;
    myCardEl.style.top = `${myY}px`;
    myCardEl.style.transform = 'translate(-50%, -50%) scale(0.5)';
    myCardEl.style.opacity = '0';
    
    opponentCardEl.style.left = `${opponentX}px`;
    opponentCardEl.style.top = `${opponentY}px`;
    opponentCardEl.style.transform = 'translate(-50%, -50%) scale(0.5)';
    opponentCardEl.style.opacity = '0';
    
    document.body.appendChild(myCardEl);
    document.body.appendChild(opponentCardEl);
    
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to([myCardEl, opponentCardEl], {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          delay: 1,
          ease: "power2.in",
          onComplete: () => {
            myCardEl.remove();
            opponentCardEl.remove();
            setBerserkerAnimationComplete(true);
          },
        });
      },
    });
    
    tl.to([myCardEl, opponentCardEl], { opacity: 1, scale: 0.8, duration: 0.3, ease: "power2.out" }, 0);
    tl.to(myCardEl, { left: centerX - 150, top: centerY, scale: 1, rotation: -5, duration: 0.6, ease: "power2.out" }, 0.3);
    tl.to(opponentCardEl, { left: centerX + 150, top: centerY, scale: 1, rotation: 5, duration: 0.6, ease: "power2.out" }, 0.3);
    tl.to([myCardEl, opponentCardEl], { scale: 1.1, duration: 0.1, ease: "power2.out" }, 0.9);
    tl.to([myCardEl, opponentCardEl], { scale: 1, duration: 0.15, ease: "bounce.out" }, 1.0);
    
    if (result === 'win') {
      tl.to(myCardEl, { scale: 1.15, boxShadow: "0 0 50px rgba(34, 197, 94, 0.8)", duration: 0.2, yoyo: true, repeat: 2, ease: "power2.inOut" }, 1.2);
      tl.to(opponentCardEl, { scale: 0.9, opacity: 0.7, duration: 0.2, ease: "power2.out" }, 1.2);
    } else if (result === 'lose') {
      tl.to(opponentCardEl, { scale: 1.15, boxShadow: "0 0 50px rgba(34, 197, 94, 0.8)", duration: 0.2, yoyo: true, repeat: 2, ease: "power2.inOut" }, 1.2);
      tl.to(myCardEl, { scale: 0.9, opacity: 0.7, duration: 0.2, ease: "power2.out" }, 1.2);
    } else {
      tl.to([myCardEl, opponentCardEl], { scale: 1.1, boxShadow: "0 0 40px rgba(251, 191, 36, 0.6)", duration: 0.2, yoyo: true, repeat: 2, ease: "power2.inOut" }, 1.2);
    }
    
  }, [berserkerComparison, berserkerAnimationComplete, gameState]);

  // GSAP: Wizard effect animation
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally not including gameState to prevent re-triggering animation
  useLayoutEffect(() => {
    if (!wizardEffectAnimation || !gameState) return;
    
    const { targetPlayerIndex, targetPlayerName, discardedCardValue, discardedCardId } = wizardEffectAnimation;
    const isTargetMe = targetPlayerIndex === gameState.myPlayerIndex;
    
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    const cardTypeKey = `Value${discardedCardValue}` as CardType;
    const cardInfo = cardConcept.cards[cardTypeKey];
    
    if (!cardInfo) {
      setWizardEffectAnimation(null);
      return;
    }
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const cardHeight = 160;
    const cardWidth = Math.round((cardHeight * 2) / 3);
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize);
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize);
    
    const totalPlayers = gameState.players.length;
    const opponentCount = totalPlayers - 1;
    let playerX: number;
    let playerY: number;
    
    if (isTargetMe) {
      playerX = viewportWidth / 2;
      playerY = viewportHeight - 100;
    } else {
      const opponentIdx = targetPlayerIndex > gameState.myPlayerIndex 
        ? targetPlayerIndex - gameState.myPlayerIndex - 1 
        : targetPlayerIndex + (totalPlayers - gameState.myPlayerIndex - 1);
      
      if (opponentCount === 1) {
        playerX = viewportWidth / 2;
        playerY = 100;
      } else if (opponentCount === 2) {
        playerX = opponentIdx === 0 ? 100 : viewportWidth - 100;
        playerY = viewportHeight / 2;
      } else {
        if (opponentIdx === 0) { playerX = 100; playerY = viewportHeight / 2; }
        else if (opponentIdx === 1) { playerX = viewportWidth / 2; playerY = 100; }
        else { playerX = viewportWidth - 100; playerY = viewportHeight / 2; }
      }
    }
    
    const discardX = viewportWidth / 2 + 80;
    const discardY = viewportHeight * 0.4;
    const deckX = viewportWidth / 2 - 80;
    const deckY = viewportHeight * 0.4;
    
    // Discarded card animation element
    const discardedCard = document.createElement('div');
    discardedCard.className = 'fixed z-[100] pointer-events-none';
    discardedCard.innerHTML = `
      <div class="flex flex-col items-center gap-1">
        <div class="relative rounded-lg overflow-hidden shadow-2xl" style="width: ${cardWidth}px; height: ${cardHeight}px; box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);">
          <img src="${cardInfo.image}" alt="${cardInfo.name}" class="absolute inset-0 w-full h-full object-contain z-0" />
          <img src="${cardConcept.frame}" alt="Frame" class="absolute inset-0 w-full h-full object-cover z-10" />
          <span class="absolute z-20 drop-shadow-lg" style="color: #d2ac77; top: 1.8%; left: 10.5%; font-size: ${valueFontSize}px; font-family: var(--font-faith-collapsing), serif; font-weight: bold;">${cardInfo.value}</span>
          <span class="absolute z-20 truncate" style="color: #402716; top: 3.3%; left: 60%; transform: translateX(-50%); font-size: ${nameFontSize}px; font-family: var(--font-god-of-war), serif; max-width: 70%; font-weight: bold;">${cardInfo.name}</span>
        </div>
        <span class="text-xs text-red-400 font-medium bg-slate-900/90 px-2 py-0.5 rounded-full">${isTargetMe ? 'Your card' : targetPlayerName} discarded!</span>
      </div>
    `;
    
    discardedCard.style.left = `${playerX}px`;
    discardedCard.style.top = `${playerY}px`;
    discardedCard.style.transform = 'translate(-50%, -50%) scale(0.5)';
    discardedCard.style.opacity = '0';
    document.body.appendChild(discardedCard);
    
    // New card from deck element
    const newCardElement = document.createElement('div');
    newCardElement.className = 'fixed z-[99] pointer-events-none';
    newCardElement.innerHTML = `
      <div class="flex flex-col items-center gap-1">
        <div class="relative rounded-lg overflow-hidden shadow-2xl" style="width: ${cardWidth}px; height: ${cardHeight}px; box-shadow: 0 0 20px rgba(34, 197, 94, 0.6);">
          <img src="${cardConcept.cardBack}" alt="Card Back" class="w-full h-full object-cover" />
        </div>
        <span class="text-xs text-green-400 font-medium bg-slate-900/90 px-2 py-0.5 rounded-full">${isTargetMe ? 'You draw' : targetPlayerName + ' draws'} new card!</span>
      </div>
    `;
    
    newCardElement.style.left = `${deckX}px`;
    newCardElement.style.top = `${deckY}px`;
    newCardElement.style.transform = 'translate(-50%, -50%) scale(0.5)';
    newCardElement.style.opacity = '0';
    document.body.appendChild(newCardElement);
    
    const masterTl = gsap.timeline({
      onComplete: () => {
        discardedCard.remove();
        newCardElement.remove();
        setHiddenDiscardCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(discardedCardId);
          return newSet;
        });
        setWizardEffectAnimation(null);
      },
    });
    
    masterTl.to(discardedCard, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });
    masterTl.to(discardedCard, { left: discardX, top: discardY, rotation: gsap.utils.random(-15, 15), duration: 0.5, ease: "power2.inOut" });
    masterTl.to(discardedCard, { opacity: 0, scale: 0.8, duration: 0.2, ease: "power2.in" });
    masterTl.to(newCardElement, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, "-=0.1");
    masterTl.to(newCardElement, { left: playerX, top: playerY, rotation: 0, duration: 0.5, ease: "power2.out" });
    masterTl.to(newCardElement, { scale: 1.1, duration: 0.1, ease: "power2.out" });
    masterTl.to(newCardElement, { scale: 1, duration: 0.15, ease: "bounce.out" });
    masterTl.to(newCardElement, { opacity: 0, scale: 0.8, duration: 0.3, delay: 0.3, ease: "power2.in" });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardEffectAnimation]);

  // GSAP: Draw card animation - card slides from deck to hand, then flips to reveal
  useLayoutEffect(() => {
    if (!drawCardAnimation) return;
    
    const { drawnCards, isRoundStart } = drawCardAnimation;
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const deckX = viewportWidth / 2 - 80;
    const deckY = viewportHeight * 0.4;
    const handY = viewportHeight - 120;
    const handXOffset = 80;
    
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    const cardHeight = 200;
    const cardWidth = Math.round((cardHeight * 2) / 3);
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize);
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize);
    const descriptionFontSize = Math.round(cardHeight * cardConcept.descriptionFontSize);
    
    drawnCards.forEach((card: GameCard, index: number) => {
      const cardTypeKey = `Value${card.value}` as CardType;
      const cardInfo = cardConcept.cards[cardTypeKey];
      
      if (!cardInfo) return;
      
      const totalCards = drawnCards.length;
      const spacing = 150;
      const baseX = viewportWidth / 2 + handXOffset;
      const startXPos = baseX - ((totalCards - 1) * spacing) / 2;
      const targetX = startXPos + index * spacing;
      
      const animatedCard = document.createElement('div');
      animatedCard.className = 'fixed z-[100] pointer-events-none';
      animatedCard.style.willChange = 'transform, left, top';
      animatedCard.style.perspective = '1000px';
      animatedCard.innerHTML = `
        <div class="card-flip-inner" style="width: ${cardWidth}px; height: ${cardHeight}px; transform-style: preserve-3d; position: relative;">
          <div class="absolute inset-0 rounded-lg overflow-hidden" style="backface-visibility: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <img src="${cardConcept.cardBack}" alt="Card Back" class="w-full h-full object-cover" />
          </div>
          <div class="absolute inset-0 rounded-lg overflow-hidden" style="backface-visibility: hidden; transform: rotateY(180deg); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <img src="${cardInfo.image}" alt="${cardInfo.name}" class="absolute inset-0 w-full h-full object-contain z-0" />
            <img src="${cardConcept.frame}" alt="Frame" class="absolute inset-0 w-full h-full object-cover z-10" />
            <span class="absolute z-20 drop-shadow-lg" style="color: #d2ac77; top: 1.8%; left: 10.5%; font-size: ${valueFontSize}px; font-family: var(--font-faith-collapsing), serif; font-weight: bold;">${cardInfo.value}</span>
            <span class="absolute z-20 truncate" style="color: #402716; top: 3.3%; left: 60%; transform: translateX(-50%); font-size: ${nameFontSize}px; font-family: var(--font-god-of-war), serif; max-width: 70%; font-weight: bold;">${cardInfo.name}</span>
            <span class="absolute z-20 text-center left-1/2 -translate-x-1/2" style="color: rgba(0,0,0,0.8); bottom: 10%; font-size: ${descriptionFontSize}px; font-family: var(--font-helvetica), sans-serif; width: 72%; font-weight: 600; line-height: 1.2;">${cardInfo.description}</span>
          </div>
        </div>
      `;
      
      animatedCard.style.left = `${deckX}px`;
      animatedCard.style.top = `${deckY}px`;
      animatedCard.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(animatedCard);
      
      const flipInner = animatedCard.querySelector('.card-flip-inner') as HTMLElement;
      const staggerDelay = isRoundStart ? index * 0.2 : 0;
      
      const tl = gsap.timeline({ delay: staggerDelay });
      
      tl.to(animatedCard, { left: targetX, top: handY, duration: 0.5, ease: "power3.out" });
      tl.to(flipInner, { rotateY: 180, duration: 0.4, ease: "power2.inOut" });
      tl.to(animatedCard, {
        opacity: 0,
        duration: 0.15,
        delay: 0.2,
        ease: "power2.in",
        onComplete: () => {
          animatedCard.remove();
          setHiddenDrawnCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(card.id);
            return newSet;
          });
          if (index === drawnCards.length - 1) {
            setDrawCardAnimation(null);
          }
        },
      });
    });
    
  }, [drawCardAnimation]);

  // GSAP: Round change celebration
  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger on round number change
  useLayoutEffect(() => {
    if (!gameState) return;
    
    if (prevRoundRef.current !== 0 && gameState.roundNumber !== prevRoundRef.current) {
      setTimeout(() => {
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 bg-amber-400/30 z-50 pointer-events-none';
        document.body.appendChild(flash);
        
        gsap.to(flash, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => flash.remove(),
        });
        
        if (headerRef.current) {
          gsap.fromTo(headerRef.current, 
            { scale: 1 },
            { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" }
          );
        }
      }, 200);
    }
    prevRoundRef.current = gameState.roundNumber;
  }, [gameState?.roundNumber]);

  // GSAP: Play button hover animation
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run once on mount
  useLayoutEffect(() => {
    if (!playButtonRef.current) return;
    
    const button = playButtonRef.current;
    
    const handleMouseEnter = () => {
      gsap.to(button, { scale: 1.05, duration: 0.2, ease: "power2.out" });
    };
    
    const handleMouseLeave = () => {
      gsap.to(button, { scale: 1, duration: 0.2, ease: "power2.out" });
    };
    
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selectedCard]);

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

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isProcessingAction = isPlayingTurn || isResolvingChancellor || isRespondingGuard || isRespondingBaron || isRespondingPrince || isSubmittingDeck || isStartingNewGame;

  // Waiting for players / deck submission
  if (room.status === GameStatus.WAITING) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-obsidian via-obsidian-deep to-obsidian-deeper flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10 px-4 max-w-md">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="h-6 w-6 text-amber-400" />
            <h1 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 tracking-wider"
              style={{ fontFamily: "var(--font-god-of-war), serif" }}
            >
              {room.name}
            </h1>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-amber-600/30">
            <p className="text-amber-300/80 text-lg mb-2">
              Players: {room.players.length}/{room.max_players}
            </p>
            <div className="space-y-2">
              {room.players.map((p) => (
                <div key={p.addr} className="flex items-center justify-between text-sm">
                  <span className="text-amber-300">
                    {p.addr === currentAccount.address ? "You" : `${p.addr.slice(0, 6)}...${p.addr.slice(-4)}`}
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
            <h1 
              className="text-2xl md:text-3xl font-bold text-amber-400 tracking-wider"
              style={{ fontFamily: "var(--font-god-of-war), serif" }}
            >
              {room.name}
            </h1>
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
            discardCount={gameState.discardPile.filter((c: GameCard) => !hiddenDiscardCards.has(c.id)).length}
            discardPile={gameState.discardPile.filter((c: GameCard) => !hiddenDiscardCards.has(c.id))}
            showStartRoundButton={gameState.gamePhase === "roundEnd" && !gameState.players.some((p) => p.hearts >= gameState.heartsToWin)}
            onStartRound={handleSubmitDeck}
            isStartingRound={isSubmittingDeck}
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

        {/* Pending Action Response UI - Auto-responding in background */}
        {needToRespond && pendingAction && (
          <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 z-30">
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg p-4 text-center">
              <Loader2 className="h-6 w-6 text-orange-400 mx-auto mb-2 animate-spin" />
              <p className="text-orange-300 font-semibold">
                {pendingAction.action_type === PendingActionType.GUARD_RESPONSE &&
                  `Knight guessed ${CardNames[pendingAction.data[0] ?? 0]}! Revealing card...`}
                {pendingAction.action_type === PendingActionType.BARON_RESPONSE &&
                  "Berserker comparison! Revealing card..."}
                {pendingAction.action_type === PendingActionType.PRINCE_RESPONSE &&
                  "Wizard effect! Discarding hand..."}
              </p>
            </div>
          </div>
        )}

        {/* Chancellor Choice UI */}
        {humanPlayer && gameState.gamePhase === "chancellorChoice" && gameState.chancellorCards.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-4 z-30 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-4 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-amber-400">Tactician: Choose card to keep</h3>

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
            {/* Cursed Idol Rule Warning */}
            {mustPlayCountess && isMyTurn && (
              <div className="absolute bottom-[200px] mb-10 left-1/2 -translate-x-1/2 z-20 animate-pulse">
                <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg border-2 border-red-400">
                  ⚠️ You have Cursed Idol with Wizard/Paladin - You MUST play Cursed Idol!
                </div>
              </div>
            )}

            {/* Cards */}
            <div
              ref={cardsContainerRef}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 justify-center flex-wrap z-10"
            >
              {humanPlayer.hand.filter((c: GameCard) => !hiddenDrawnCards.has(c.id)).map((card) => {
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
                          // Reset target and guess when selecting a card that doesn't require them
                          if (newSelectedId) {
                            const newSelectedCard = humanPlayer?.hand.find((c: GameCard) => c.id === newSelectedId);
                            if (newSelectedCard && !cardRequiresTarget(newSelectedCard)) {
                              setSelectedTarget(null);
                            } else if (newSelectedCard && cardRequiresTarget(newSelectedCard)) {
                              // If new card requires target but is not Prince, and current target is self, reset target
                              if (newSelectedCard.value !== 5 && selectedTarget === gameState.myPlayerIndex) {
                                setSelectedTarget(null);
                              }
                            }
                            if (newSelectedCard && !cardRequiresGuess(newSelectedCard)) {
                              setSelectedGuess(null);
                            }
                          } else {
                            // Deselecting card - reset everything
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

            {/* Guess Selection (Knight) */}
            {isMyTurn && selectedCard?.value === 1 && selectedTarget !== null && (
              <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 z-10">
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
                        {cardValue}. {cardData.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Healer Reveal Modal */}
            {revealedCard && (
              <button 
                type="button"
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in cursor-pointer"
                onClick={() => setRevealedCard(null)}
              >
                <div 
                  className="flex flex-col items-center gap-4 rounded-lg p-6 animate-scale-in"
                >
                  <h3 className="text-xl font-bold text-amber-400">
                    {revealedCard.targetAddress.slice(0, 6)}...{revealedCard.targetAddress.slice(-4)}&apos;s Card
                  </h3>
                  <div className="relative">
                    <CardCharacter
                      cardType={mapCardValueToCardType(revealedCard.card.value)}
                      size="md"
                      flip={true}
                    />
                  </div>
                  <p className="text-sm text-amber-300">
                    {revealedCard.card.name}
                  </p>
                  <p className="text-xs text-amber-400/50">
                    Click anywhere or wait to close
                  </p>
                </div>
              </button>
            )}

            {/* Berserker Comparison Modal - Show after animation completes */}
            {berserkerComparison && berserkerAnimationComplete && (
              <button 
                type="button"
                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in cursor-pointer"
                onClick={() => {
                  setBerserkerComparison(null);
                  setBerserkerAnimationComplete(false);
                }}
              >
                <div 
                  className="flex flex-col items-center gap-6 rounded-lg p-6 animate-scale-in"
                >
                  <h3 className="text-xl font-bold text-amber-400">Berserker Comparison</h3>
                  
                  {/* Cards comparison */}
                  <div className="flex items-center gap-8">
                    {/* My card */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-amber-300 font-semibold">You</p>
                      <div className={cn(
                        "relative rounded-lg p-1",
                        berserkerComparison.result === 'win' && "ring-4 ring-green-400",
                        berserkerComparison.result === 'lose' && "ring-4 ring-red-400",
                        berserkerComparison.result === 'tie' && "ring-4 ring-yellow-400"
                      )}>
                        <CardCharacter
                          cardType={mapCardValueToCardType(berserkerComparison.myCard.value)}
                          size="sm"
                          flip={true}
                        />
                      </div>
                      <p className="text-sm text-amber-300">{berserkerComparison.myCard.name}</p>
                      <p className="text-lg font-bold text-amber-400">Value: {berserkerComparison.myCard.value}</p>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl font-bold text-amber-500">VS</span>
                      <div className={cn(
                        "px-4 py-2 rounded-lg font-bold text-lg",
                        berserkerComparison.result === 'win' && "bg-green-500/20 text-green-400",
                        berserkerComparison.result === 'lose' && "bg-red-500/20 text-red-400",
                        berserkerComparison.result === 'tie' && "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {berserkerComparison.result === 'win' && '🎉 WIN!'}
                        {berserkerComparison.result === 'lose' && '💀 LOSE'}
                        {berserkerComparison.result === 'tie' && '🤝 TIE'}
                      </div>
                    </div>

                    {/* Opponent card */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm text-amber-300 font-semibold">
                        {berserkerComparison.opponentAddress.slice(0, 6)}...{berserkerComparison.opponentAddress.slice(-4)}
                      </p>
                      <div className={cn(
                        "relative rounded-lg p-1",
                        berserkerComparison.result === 'lose' && "ring-4 ring-green-400",
                        berserkerComparison.result === 'win' && "ring-4 ring-red-400",
                        berserkerComparison.result === 'tie' && "ring-4 ring-yellow-400"
                      )}>
                        <CardCharacter
                          cardType={mapCardValueToCardType(berserkerComparison.opponentCard.value)}
                          size="sm"
                          flip={true}
                        />
                      </div>
                      <p className="text-sm text-amber-300">{berserkerComparison.opponentCard.name}</p>
                      <p className="text-lg font-bold text-amber-400">Value: {berserkerComparison.opponentCard.value}</p>
                    </div>
                  </div>

                  <p className="text-xs text-amber-400/50">
                    Click anywhere or wait to close
                  </p>
                </div>
              </button>
            )}

            {/* Waiting for turn */}
            {!isMyTurn && humanPlayer && !humanPlayer.isEliminated && (
              <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-10">
                <div className=" px-4 py-2 rounded-lg mb-4">
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
            <div className="backdrop-blur-xl rounded-lg p-3 max-h-40 overflow-y-auto">
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

        {/* Priest Reveal Modal */}
        {showHealerModal && healerRevealedCard && (
          <button
            type="button"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowHealerModal(false)}
          >
            <div
              className="rounded-xl p-8 max-w-md cursor-default text-center"
              role="dialog"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Eye className="h-6 w-6 text-amber-400" />
                <h3 className="text-2xl font-bold text-amber-400">Healer Vision</h3>
              </div>
              
              <p className="text-amber-300/80 mb-6">
                You peek at <span className="text-white font-semibold">{healerRevealedCard.targetPlayerName}</span>&apos;s hand...
              </p>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/30 blur-xl rounded-full" />
                  <CardCharacter 
                    cardType={mapCardValueToCardType(healerRevealedCard.cardValue)} 
                    size="md" 
                  />
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <p className="text-3xl font-bold text-white mb-1">
                  {CardNames[healerRevealedCard.cardValue] || "Unknown"}
                </p>
                <p className="text-amber-400 text-lg">
                  Value: {healerRevealedCard.cardValue}
                </p>
              </div>
              
              <p className="text-amber-400/60 text-sm mb-4">
                This vision expires at turn {healerRevealedCard.expiresTurn}
              </p>
              
              <Button
                onClick={() => setShowHealerModal(false)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Got it!
              </Button>
            </div>
          </button>
        )}

        {/* Healer Reveal Indicator (persistent) */}
        {healerRevealedCard && !showHealerModal && room && Number(room.current_turn) < healerRevealedCard.expiresTurn && (
          <button
            type="button"
            onClick={() => setShowHealerModal(true)}
            className="fixed bottom-4 left-4 z-40 bg-amber-600/90 hover:bg-amber-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all hover:scale-105"
          >
            <Eye className="h-5 w-5" />
            <div className="text-left">
              <p className="text-sm font-semibold">
                {healerRevealedCard.targetPlayerName}&apos;s card:
              </p>
              <p className="text-lg font-bold">
                {CardNames[healerRevealedCard.cardValue]} ({healerRevealedCard.cardValue})
              </p>
            </div>
          </button>
        )}

        {/* Discard Pile Modal */}
        {showDiscardModal && (() => {
          // Build visible log entries that aren't hidden
          const visibleLogEntries = room.discarded_cards_log
            .map((entry, idx) => ({
              ...entry,
              cardId: `discard-log-${idx}-turn-${entry.turn_number}`,
              logIdx: idx,
            }))
            .filter(entry => !hiddenDiscardCards.has(entry.cardId));
          
          return (
          <button 
            type="button"
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
            onClick={() => setShowDiscardModal(false)}
          >
            <div 
              className="rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto animate-scale-in text-left"
            >
              <div className="flex justify-center items-center mb-4 min-w-56">
                <h3 className="text-xl font-bold text-amber-400">Discarded Cards ({visibleLogEntries.length})</h3>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {visibleLogEntries.map((entry) => {
                  const cardData = CARD_DATA_MAP[entry.card_value];
                  const isMyCard = entry.player_addr === currentAccount?.address;
                  const playerLabel = isMyCard ? 'You' : `${entry.player_addr.slice(0, 6)}...${entry.player_addr.slice(-4)}`;
                  return (
                    <div
                      key={entry.cardId}
                      className="flex flex-col items-center gap-1"
                    >
                      <CardCharacter
                        cardType={mapCardValueToCardType(entry.card_value)}
                        size="xs"
                      />
                      <span className="text-xs text-amber-400 font-medium">{cardData?.name || 'Unknown'}</span>
                      <span className="text-[10px] text-amber-300/60">{playerLabel}</span>
                    </div>
                  );
                })}
              </div>
              {visibleLogEntries.length === 0 && (
                <p className="text-center text-amber-400/70 mt-4">No cards discarded yet</p>
              )}
              {/* Click anywhere hint */}
              <p className="text-center text-amber-400/50 text-xs mt-6">Click anywhere to close</p>
            </div>
          </button>
          );
        })()}

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
