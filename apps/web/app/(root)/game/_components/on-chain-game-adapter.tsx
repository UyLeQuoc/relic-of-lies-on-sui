'use client';

import { type ActionPhase, type GameCard, type Player } from '@/components/game/game-context';
import { Button } from '@/components/ui/button';
import { GameTable } from '@/components/game-table';
import { GameCardComponent } from '@/components/game/game-card';
import { CardCharacter } from '@/components/common/game-ui/cards/card-character';
import { CardType, CardConceptType, cardsMap } from '@/components/common/game-ui/cards/types';
import { cn } from '@/lib/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCallback, useEffect, useMemo, useState, useRef, useLayoutEffect } from 'react';
import {
    useGetRoom,
    usePlayTurn,
    useResolveChancellor,
    useStartRound,
    type GameRoomType,
} from '@/hooks/use-game-contract';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

// Card data mapping
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
    throw new Error(`Invalid card value: ${cardValue}`);
  }
  return {
    id,
    ...data,
  };
}

function convertOnChainRoomToGameState(
  room: GameRoomType,
  currentAccount: string
) {
  const myPlayerIndex = room.players.findIndex(p => p.addr === currentAccount);
  const currentPlayerIndex = room.status === 1 ? (Number(room.current_turn) % room.players.length) : 0;

  // Convert players
  const players: Player[] = room.players.map((p, idx) => {
    const hand = p.hand.map((cardValue, cardIdx) => 
      createCard(cardValue, `player-${idx}-hand-${cardIdx}-round-${room.round_number}`)
    );
    const discardedCards = p.discarded.map((cardValue, cardIdx) => 
      createCard(cardValue, `player-${idx}-discarded-${cardIdx}-round-${room.round_number}`)
    );

    return {
      id: p.addr,
      name: idx === myPlayerIndex ? 'You' : `Player ${idx + 1}`,
      avatar: '/placeholder.svg',
      hand,
      discardedCards,
      isEliminated: !p.is_alive,
      isProtected: p.is_immune,
      hearts: p.tokens,
      isBot: idx !== myPlayerIndex,
      playedSpy: p.has_played_spy || p.discarded.includes(0) || p.hand.includes(0),
    };
  });

  // Convert deck - use stable IDs based on round number
  const deck: GameCard[] = room.deck.map((cardValue, idx) => 
    createCard(cardValue, `deck-${idx}-round-${room.round_number}`)
  );

  // Convert discard pile - use stable IDs based on round number
  const discardPile: GameCard[] = [];
  room.players.forEach((p, playerIdx) => {
    p.discarded.forEach((cardValue, cardIdx) => {
      discardPile.push(createCard(cardValue, `discard-${playerIdx}-${cardIdx}-round-${room.round_number}`));
    });
  });

  // Removed cards - use stable IDs based on round number
  const removedCards: GameCard[] = [];
  if (room.burn_card !== null && room.burn_card !== undefined) {
    removedCards.push(createCard(Number(room.burn_card), `burn-card-round-${room.round_number}`));
  }
  room.public_cards.forEach((cardValue, idx) => {
    removedCards.push(createCard(cardValue, `public-${idx}-round-${room.round_number}`));
  });

  // Game phase
  let gamePhase: 'setup' | 'playing' | 'roundEnd' | 'gameEnd' | 'chancellorChoice' | 'chancellorReturnOrder' = 'setup';
  if (room.status === 0) {
    gamePhase = 'setup';
  } else if (room.status === 1) {
    if (room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx)) {
      gamePhase = 'chancellorChoice';
    } else {
      gamePhase = 'playing';
    }
  } else if (room.status === 2) {
    gamePhase = 'roundEnd';
  } else if (room.status === 3) {
    gamePhase = 'gameEnd';
  }

  // Use stable IDs for chancellor cards - based on round number and position index only
  // This ensures unique IDs even for duplicate card values
  const chancellorCards = room.chancellor_cards.map((cardValue, idx) => 
    createCard(cardValue, `chancellor-card-${idx}-round-${room.round_number}`)
  );

  return {
    players,
    deck,
    discardPile,
    removedCards,
    deckCount: deck.length,
    currentPlayerIndex,
    gamePhase,
    roundNumber: room.round_number,
    heartsToWin: room.tokens_to_win,
    myPlayerIndex,
    chancellorCards,
  };
}

interface OnChainGameAdapterProps {
  roomId: string;
}

export function OnChainGameAdapter({ roomId }: OnChainGameAdapterProps) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { room, fetchRoom, isLoading, error } = useGetRoom(roomId);
  const { startRound, isPending: isStartingRound } = useStartRound();
  const { playTurn, isPending: isPlayingTurn } = usePlayTurn();
  const { resolveChancellor, isPending: isResolvingChancellor } = useResolveChancellor();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [actionPhase, setActionPhase] = useState<ActionPhase>('idle');
  const [currentActionText, setCurrentActionText] = useState('');
  const [resultNotification, setResultNotification] = useState<{ type: 'success' | 'failure' | 'info' | 'neutral'; title: string; message: string } | null>(null);
  const [isWalletChecked, setIsWalletChecked] = useState(false);

  // Check wallet connection status
  useEffect(() => {
    // Give wallet some time to initialize, then mark as checked
    const timer = setTimeout(() => {
      setIsWalletChecked(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch room data periodically
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Convert on-chain room to game state
  const gameState = useMemo(() => {
    if (!room || !currentAccount?.address) return null;
    return convertOnChainRoomToGameState(room, currentAccount.address);
  }, [room, currentAccount]);

  // Handle start round
  const handleStartRound = async () => {
    setActionPhase('drawing');
    setCurrentActionText('Starting round...');
    try {
      await startRound(roomId);
      setActionPhase('idle');
      setCurrentActionText('');
      fetchRoom();
    } catch (err) {
      setActionPhase('idle');
      setCurrentActionText('');
      setResultNotification({
        type: 'failure',
        title: 'Failed to Start Round',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
    window.location.reload();
  };

  // Show loading while checking wallet
  if (!isWalletChecked || (isLoading && !room)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Wallet Not Connected</h1>
          <p className="text-muted-foreground mt-2">Please connect your wallet to play.</p>
          <Button onClick={() => router.push('/rooms')} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (error || !room || !gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-muted-foreground mt-2">{error?.message || 'Room not found'}</p>
          <Button onClick={() => router.push('/rooms')} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  const canStartRound = (room.status === 0 || room.status === 2) && 
    room.players.length >= 2 &&
    (room.creator === currentAccount.address || gameState.myPlayerIndex >= 0);

  // Start screen if waiting
  if (room.status === 0) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gradient-to-b from-obsidian via-obsidian-deep to-obsidian-deeper flex items-center justify-center relative overflow-hidden">
          <div className="text-center z-10 px-4 max-w-md">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 mb-4">
              {room.name}
            </h1>
            <p className="text-violet-300/80 text-lg mb-8">
              Waiting for players ({room.players.length}/{room.max_players})
            </p>
            {canStartRound && (
              <Button 
                onClick={handleStartRound}
                disabled={isStartingRound}
                size="lg"
                className="w-full"
              >
                {isStartingRound ? 'Starting Round...' : 'Start Round'}
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => router.push('/rooms')}
              className="mt-4 w-full"
            >
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use OnChainGame with improved UI using game components styling
  return (
    <OnChainGameWithUI
      room={room}
      roomId={roomId}
      gameState={gameState}
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      isProcessingAction={isPlayingTurn || isResolvingChancellor || isStartingRound}
      playTurn={playTurn}
      resolveChancellor={resolveChancellor}
      resultNotification={resultNotification}
      setResultNotification={setResultNotification}
      fetchRoom={fetchRoom}
      router={router}
      handleStartRound={handleStartRound}
      isStartingRound={isStartingRound}
    />
  );
}

// Game UI using styling from game components but with on-chain logic
function OnChainGameWithUI({
  room,
  roomId,
  gameState,
  isDarkMode,
  setIsDarkMode,
  isProcessingAction,
  playTurn,
  resolveChancellor,
  resultNotification,
  setResultNotification,
  fetchRoom,
  router,
  handleStartRound,
  isStartingRound,
}: any) {
  const currentAccount = useCurrentAccount();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [chancellorKeepCard, setChancellorKeepCard] = useState<GameCard | null>(null);
  const [chancellorReturnOrder, setChancellorReturnOrder] = useState<GameCard[]>([]);
  const [revealedCard, setRevealedCard] = useState<{ card: GameCard; targetName: string; targetAddress: string } | null>(null);
  const lastPriestPlayRef = useRef<{ targetIndex: number; timestamp: number } | null>(null);
  
  // Baron comparison state
  const [baronComparison, setBaronComparison] = useState<{
    myCard: GameCard;
    myAddress: string;
    opponentCard: GameCard;
    opponentAddress: string;
    result: 'win' | 'lose' | 'tie';
  } | null>(null);
  const lastBaronPlayRef = useRef<{ targetIndex: number; myCardValue: number; timestamp: number } | null>(null);

  // Discard pile modal state
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // GSAP Animation refs
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const turnIndicatorRef = useRef<HTMLDivElement>(null);
  const prevHandLength = useRef<number>(0);
  const prevHandCardsRef = useRef<GameCard[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
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
  
  // Track previous discard state to detect new cards played by any player
  const prevDiscardPileRef = useRef<GameCard[]>([]);
  const prevRoundForDiscardRef = useRef<number>(0);
  
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
  
  // Track pending wizard effect (when wizard was played but target's discard not yet detected)
  const pendingWizardRef = useRef<{
    wizardPlayerIndex: number;
    timestamp: number;
  } | null>(null);
  
  // Round winner display state
  const [roundWinner, setRoundWinner] = useState<{
    playerIndex: number;
    playerName: string;
    reason: string;
    cardValue?: number;
  } | null>(null);
  const prevGamePhaseRef = useRef<string>('');

  const humanPlayer = gameState.players.find((p: Player) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && !currentPlayer.isBot && gameState.gamePhase === 'playing';
  
  // Find selected card object from hand (based on id to uniquely identify each card)
  const selectedCard = selectedCardId ? humanPlayer?.hand.find((c: GameCard) => c.id === selectedCardId) || null : null;
  
  // Check card count - display cards that player currently has on chain
  const hasOneCard = humanPlayer && humanPlayer.hand.length === 1;
  const hasTwoCards = humanPlayer && humanPlayer.hand.length === 2;

  // Check Countess rule: If you have Countess (8) with King (7) or Prince (5), you MUST discard Countess
  const mustPlayCountess = useMemo(() => {
    if (!humanPlayer || humanPlayer.hand.length < 2) return false;
    const hasCountess = humanPlayer.hand.some((c: GameCard) => c.value === 8);
    const hasKingOrPrince = humanPlayer.hand.some((c: GameCard) => c.value === 7 || c.value === 5);
    return hasCountess && hasKingOrPrince;
  }, [humanPlayer]);

  // Get the Countess card if mustPlayCountess is true
  const countessCard = useMemo(() => {
    if (!mustPlayCountess || !humanPlayer) return null;
    return humanPlayer.hand.find((c: GameCard) => c.value === 8) || null;
  }, [mustPlayCountess, humanPlayer]);

  // Check if card requires target
  const cardRequiresTarget = (card: GameCard | null): boolean => {
    if (!card) return false;
    return [1, 2, 3, 5, 7].includes(card.value); // Guard, Priest, Baron, Prince, King
  };

  // Check if card requires guess (Guard only)
  const cardRequiresGuess = (card: GameCard | null): boolean => {
    if (!card) return false;
    return card.value === 1; // Guard
  };

  // Get valid targets for current card
  const getValidTargets = useCallback(() => {
    if (!selectedCard || gameState.myPlayerIndex < 0) return [];
    
    return gameState.players
      .map((p: Player, idx: number) => ({ player: p, index: idx }))
      .filter((item: { player: Player; index: number }) => {
        const { player, index } = item;
        const isSelf = index === gameState.myPlayerIndex;
        
        // Can't target self (except Prince)
        if (selectedCard.value !== 5 && isSelf) return false;
        // Can't target eliminated players
        if (player.isEliminated) return false;
        // Can't target immune players (except self with Prince - Handmaid only protects from others)
        if (player.isProtected && !(selectedCard.value === 5 && isSelf)) return false;
        return true;
      });
  }, [selectedCard, gameState.myPlayerIndex, gameState.players]);

  const handlePlayCard = async () => {
    if (!selectedCardId || !selectedCard) return;
    
    try {
      // For Prince (value 5), if no target selected, allow targeting self
      // For other cards requiring target, if no valid target, still allow play (card will be skipped)
      let targetToUse = selectedTarget;
      
      // If Prince and no target selected, use self as target
      if (selectedCard.value === 5 && targetToUse === null && gameState.myPlayerIndex >= 0) {
        targetToUse = gameState.myPlayerIndex;
      }
      
      // Store target for Priest reveal or Baron comparison
      const isPriest = selectedCard.value === 2;
      const isBaron = selectedCard.value === 3;
      const targetIndex = targetToUse;
      
      // For Baron, store my card value before playing (the other card in hand, not the Baron)
      const myCardForBaron = isBaron && humanPlayer ? 
        humanPlayer.hand.find((c: GameCard) => c.id !== selectedCardId) : null;
      
      await playTurn(
        roomId,
        selectedCard.value,
        targetToUse,
        selectedGuess
      );
      
      // If Priest was played, store target info to reveal after room update
      if (isPriest && targetIndex !== null && targetIndex >= 0) {
        lastPriestPlayRef.current = {
          targetIndex,
          timestamp: Date.now()
        };
      }
      
      // If Baron was played, store info to show comparison after room update
      if (isBaron && targetIndex !== null && targetIndex >= 0 && myCardForBaron) {
        lastBaronPlayRef.current = {
          targetIndex,
          myCardValue: myCardForBaron.value,
          timestamp: Date.now()
        };
      }
      
      setSelectedCardId(null);
      setSelectedTarget(null);
      setSelectedGuess(null);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: 'failure',
        title: 'Failed to Play Card',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };
  
  // Monitor for Priest reveal after room updates
  useEffect(() => {
    if (!room || !gameState || !lastPriestPlayRef.current) return;
    
    const { targetIndex, timestamp } = lastPriestPlayRef.current;
    
    // Only reveal if it was recent (within last 10 seconds)
    if (Date.now() - timestamp > 10000) {
      lastPriestPlayRef.current = null;
      return;
    }
    
    // Get target's card
    const targetPlayer = gameState.players[targetIndex];
    if (targetPlayer && targetPlayer.hand.length > 0) {
      const targetCard = targetPlayer.hand[0];
      setRevealedCard({
        card: targetCard,
        targetName: targetPlayer.name,
        targetAddress: targetPlayer.id
      });
      
      // Clear the ref
      lastPriestPlayRef.current = null;
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setRevealedCard(null);
      }, 10000);
    }
  }, [room, gameState]);
  
  // Monitor for Baron comparison after room updates
  useEffect(() => {
    if (!room || !gameState || !lastBaronPlayRef.current || !humanPlayer) return;
    
    const { targetIndex, myCardValue, timestamp } = lastBaronPlayRef.current;
    
    // Only show if it was recent (within last 10 seconds)
    if (Date.now() - timestamp > 10000) {
      lastBaronPlayRef.current = null;
      return;
    }
    
    // Get target's card (if they still have one - they might be eliminated)
    const targetPlayer = gameState.players[targetIndex];
    const myPlayer = gameState.players[gameState.myPlayerIndex];
    
    if (targetPlayer) {
      // Determine opponent's card value from their hand or discard pile
      let opponentCardValue: number;
      
      if (targetPlayer.hand.length > 0) {
        // Opponent still has a card (they won or tied)
        opponentCardValue = targetPlayer.hand[0].value;
      } else if (targetPlayer.isEliminated) {
        // Opponent was eliminated, their card was in discard
        // We need to infer it - in Baron, lower card loses
        // If opponent is eliminated and we're not, opponent had lower card
        if (!myPlayer?.isEliminated) {
          opponentCardValue = myCardValue - 1; // Estimate - opponent had lower
        } else {
          opponentCardValue = myCardValue; // Both eliminated - shouldn't happen with Baron tie
        }
      } else {
        // Opponent alive but no cards? Shouldn't happen
        lastBaronPlayRef.current = null;
        return;
      }
      
      // Determine result
      let result: 'win' | 'lose' | 'tie';
      if (myCardValue > opponentCardValue) {
        result = 'win';
      } else if (myCardValue < opponentCardValue) {
        result = 'lose';
      } else {
        result = 'tie';
      }
      
      setBaronComparison({
        myCard: createCard(myCardValue, 'my-baron-card'),
        myAddress: myPlayer?.id || '',
        opponentCard: createCard(opponentCardValue, 'opponent-baron-card'),
        opponentAddress: targetPlayer.id,
        result,
      });
      
      // Clear the ref
      lastBaronPlayRef.current = null;
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setBaronComparison(null);
      }, 10000);
    }
  }, [room, gameState, humanPlayer]);
  
  // Auto-select Countess when mustPlayCountess rule applies
  useEffect(() => {
    if (mustPlayCountess && countessCard && isMyTurn && !selectedCardId) {
      setSelectedCardId(countessCard.id);
    }
  }, [mustPlayCountess, countessCard, isMyTurn, selectedCardId]);

  // Detect when any player plays a card (by monitoring discard pile changes)
  useEffect(() => {
    if (!gameState || !room) return;
    
    const currentDiscardPile = gameState.discardPile;
    const prevDiscardPile = prevDiscardPileRef.current;
    
    // Reset tracking on round change
    if (gameState.roundNumber !== prevRoundForDiscardRef.current) {
      prevDiscardPileRef.current = [...currentDiscardPile];
      prevRoundForDiscardRef.current = gameState.roundNumber;
      setHiddenDiscardCards(new Set()); // Clear hidden cards on new round
      pendingWizardRef.current = null;
      return;
    }
    
    // Check if discard pile grew (someone played a card)
    const newCardsCount = currentDiscardPile.length - prevDiscardPile.length;
    if (newCardsCount > 0) {
      // Get all new cards added
      const newCards = currentDiscardPile.slice(-newCardsCount);
      
      // Find the main card played and check for wizard
      let mainCard = newCards[0];
      let wizardCard: GameCard | null = null;
      let targetDiscardedCard: GameCard | null = null;
      
      // Check if Wizard (5) was played
      for (const card of newCards) {
        if (card.value === 5) {
          wizardCard = card;
          mainCard = card;
        }
      }
      
      // Case 1: Wizard and target's card arrive together (2+ cards at once)
      if (wizardCard && newCardsCount >= 2) {
        targetDiscardedCard = newCards.find((c: GameCard) => c.id !== wizardCard!.id) || null;
      }
      
      // Case 2: Check if there's a pending wizard waiting for target's discard
      // (single card arrived that is NOT a wizard - could be the target's forced discard)
      if (!wizardCard && newCardsCount === 1 && pendingWizardRef.current) {
        const pendingWizard = pendingWizardRef.current;
        // Only process if within 5 seconds of wizard being played
        if (Date.now() - pendingWizard.timestamp < 5000) {
          const newCard = newCards[0];
          // Find who owns this discarded card
          let cardOwnerIndex = -1;
          for (let i = 0; i < gameState.players.length; i++) {
            const player = gameState.players[i];
            if (player.discardedCards.some((c: GameCard) => c.id === newCard.id)) {
              cardOwnerIndex = i;
              break;
            }
          }
          // If the card belongs to a different player than the wizard player, it's the target
          if (cardOwnerIndex !== -1 && cardOwnerIndex !== pendingWizard.wizardPlayerIndex) {
            targetDiscardedCard = newCard;
            // Get target info
            const targetPlayer = gameState.players[cardOwnerIndex];
            const targetPlayerName = targetPlayer?.name === 'You' ? 'You' : (targetPlayer?.name || `Player ${cardOwnerIndex + 1}`);
            
            // Hide this card and trigger wizard effect
            setHiddenDiscardCards(prev => new Set(prev).add(newCard.id));
            
            setTimeout(() => {
              setWizardEffectAnimation({
                targetPlayerIndex: cardOwnerIndex,
                targetPlayerName,
                discardedCardValue: newCard.value,
                discardedCardId: newCard.id,
              });
            }, 200);
            
            pendingWizardRef.current = null;
            prevDiscardPileRef.current = [...currentDiscardPile];
            return;
          }
        } else {
          // Timeout - clear pending wizard
          pendingWizardRef.current = null;
        }
      }
      
      if (mainCard) {
        // Hide all new cards from discard pile until animation completes
        setHiddenDiscardCards(prev => {
          const newSet = new Set(prev);
          newCards.forEach((c: GameCard) => newSet.add(c.id));
          return newSet;
        });
        
        // Determine which player played the main card
        let playerWhoPlayed = -1;
        let playerName = '';
        
        for (let i = 0; i < gameState.players.length; i++) {
          const player = gameState.players[i];
          if (player.discardedCards.some((c: GameCard) => c.id === mainCard.id)) {
            playerWhoPlayed = i;
            playerName = player.name;
            break;
          }
        }
        
        if (playerWhoPlayed === -1) {
          const prevPlayerIndex = (gameState.currentPlayerIndex - 1 + gameState.players.length) % gameState.players.length;
          playerWhoPlayed = prevPlayerIndex;
          playerName = gameState.players[prevPlayerIndex]?.name || `Player ${prevPlayerIndex + 1}`;
        }
        
        // Trigger main card animation
        setThrownCardAnimation({
          cardValue: mainCard.value,
          playerIndex: playerWhoPlayed,
          playerName: playerName,
          cardId: mainCard.id,
        });
        
        // If Wizard was played
        if (wizardCard) {
          if (targetDiscardedCard) {
            // Case 1: Both cards arrived together - trigger wizard effect
            let targetPlayerIndex = -1;
            let targetPlayerName = '';
            
            for (let i = 0; i < gameState.players.length; i++) {
              const player = gameState.players[i];
              if (player.discardedCards.some((c: GameCard) => c.id === targetDiscardedCard!.id)) {
                targetPlayerIndex = i;
                targetPlayerName = player.name === 'You' ? 'You' : player.name;
                break;
              }
            }
            
            if (targetPlayerIndex !== -1) {
              setTimeout(() => {
                setWizardEffectAnimation({
                  targetPlayerIndex,
                  targetPlayerName,
                  discardedCardValue: targetDiscardedCard!.value,
                  discardedCardId: targetDiscardedCard!.id,
                });
              }, 1200);
            }
          } else {
            // Case 2: Only wizard arrived - set pending to watch for target's discard
            pendingWizardRef.current = {
              wizardPlayerIndex: playerWhoPlayed,
              timestamp: Date.now(),
            };
          }
        }
      }
    }
    
    // Update ref for next comparison
    prevDiscardPileRef.current = [...currentDiscardPile];
  }, [gameState, room]);

  // GSAP: Card thrown to table animation - visible to all players
  useLayoutEffect(() => {
    if (!thrownCardAnimation) return;
    
    const { cardValue, playerIndex, playerName, cardId } = thrownCardAnimation;
    const isMyCard = playerIndex === gameState.myPlayerIndex;
    
    // Get card data from cardsMap (types.tsx)
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    const cardTypeKey = `Value${cardValue}` as CardType;
    const cardInfo = cardConcept.cards[cardTypeKey];
    
    if (!cardInfo) {
      console.warn(`Card type ${cardTypeKey} not found`);
      setThrownCardAnimation(null);
      return;
    }
    
    // Card size for animation (similar to CardCharacter sm size = 200px height)
    const cardHeight = 200;
    const cardWidth = Math.round((cardHeight * 2) / 3); // 133px
    
    // Font sizes based on card height (matching CardCharacter ratios from cardsMap)
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize); // ~20px
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize); // ~10px
    const descriptionFontSize = Math.round(cardHeight * cardConcept.descriptionFontSize); // ~6px
    
    // Create the animated card element with actual card assets
    const animatedCard = document.createElement('div');
    animatedCard.className = 'fixed z-[100] pointer-events-none';
    animatedCard.id = 'thrown-card-animation';
    
    // Card design using actual card assets from cardsMap - matching CardCharacter component structure
    animatedCard.innerHTML = `
      <div class="flex flex-col items-center gap-2">
        <div class="relative rounded-lg overflow-hidden shadow-2xl" style="width: ${cardWidth}px; height: ${cardHeight}px; box-shadow: 0 0 30px rgba(251, 191, 36, 0.5);">
          <!-- Character image at the bottom -->
          <img 
            src="${cardInfo.image}" 
            alt="${cardInfo.name}" 
            class="absolute inset-0 w-full h-full object-contain z-0"
          />
          <!-- Frame on top of character -->
          <img 
            src="${cardConcept.frame}" 
            alt="Frame" 
            class="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
          />
          <!-- Value -->
          <span 
            class="absolute z-20 drop-shadow-lg"
            style="
              color: #d2ac77;
              top: 1.8%;
              left: 10.5%;
              font-size: ${valueFontSize}px;
              font-family: var(--font-faith-collapsing), serif;
              font-weight: bold;
            "
          >${cardInfo.value}</span>
          <!-- Name -->
          <span 
            class="absolute z-20 truncate"
            style="
              color: #402716;
              top: 3.3%;
              left: 60%;
              transform: translateX(-50%);
              font-size: ${nameFontSize}px;
              font-family: var(--font-god-of-war), serif;
              max-width: 70%;
              font-weight: bold;
            "
          >${cardInfo.name}</span>
          <!-- Description -->
          <p 
            class="absolute z-20 text-center"
            style="
              color: rgba(0, 0, 0, 0.8);
              bottom: 10%;
              left: 50%;
              transform: translateX(-50%);
              font-size: ${descriptionFontSize}px;
              font-family: var(--font-helvetica), sans-serif;
              width: 72%;
              font-weight: 600;
              line-height: 1.2;
            "
          >${cardInfo.description}</p>
        </div>
        <div class="bg-slate-900/90 px-3 py-1.5 rounded-full border border-amber-500/50 shadow-lg">
          <span class="text-sm font-medium text-amber-400">${isMyCard ? 'You' : playerName}</span>
        </div>
      </div>
    `;
    
    // Calculate start position based on which player played
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let startX: number;
    let startY: number;
    
    // Get player positions (simplified - based on typical positions)
    const totalPlayers = gameState.players.length;
    const opponentCount = totalPlayers - 1;
    
    if (isMyCard) {
      // Start from bottom center (my cards position)
      startX = viewportWidth / 2;
      startY = viewportHeight - 100;
    } else {
      // Calculate opponent position
      const opponentIdx = playerIndex > gameState.myPlayerIndex 
        ? playerIndex - gameState.myPlayerIndex - 1 
        : playerIndex + (totalPlayers - gameState.myPlayerIndex - 1);
      
      if (opponentCount === 1) {
        // Single opponent at top
        startX = viewportWidth / 2;
        startY = 100;
      } else if (opponentCount === 2) {
        // Two opponents at left and right
        if (opponentIdx === 0) {
          startX = 100;
          startY = viewportHeight / 2;
        } else {
          startX = viewportWidth - 100;
          startY = viewportHeight / 2;
        }
      } else {
        // Three opponents at left, top, right
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
    
    // Target position - center of table
    const targetX = viewportWidth / 2;
    const targetY = viewportHeight * 0.4; // 40% from top (center table area)
    
    // Set initial position
    animatedCard.style.left = `${startX}px`;
    animatedCard.style.top = `${startY}px`;
    animatedCard.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(-15deg)';
    animatedCard.style.opacity = '0';
    
    document.body.appendChild(animatedCard);
    
    // Create timeline for the throw animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out and remove, then reveal card in discard pile
        gsap.to(animatedCard, {
          opacity: 0,
          scale: 0.8,
          duration: 0.3,
          delay: 0.6,
          ease: "power2.in",
          onComplete: () => {
            animatedCard.remove();
            // Reveal the card in discard pile after animation
            setHiddenDiscardCards(prev => {
              const newSet = new Set(prev);
              newSet.delete(cardId);
              return newSet;
            });
            setThrownCardAnimation(null);
          },
        });
      },
    });
    
    // Phase 1: Card appears and lifts up
    tl.to(animatedCard, {
      opacity: 1,
      scale: 0.8,
      rotation: -5,
      duration: 0.2,
      ease: "power2.out",
    });
    
    // Phase 2: Card flies to center table with arc motion
    tl.to(animatedCard, {
      left: targetX,
      top: targetY,
      scale: 1,
      rotation: gsap.utils.random(-10, 10),
      duration: 0.5,
      ease: "power2.out",
    });
    
    // Phase 3: Card lands with bounce
    tl.to(animatedCard, {
      scale: 1.1,
      duration: 0.1,
      ease: "power2.out",
    });
    
    tl.to(animatedCard, {
      scale: 1,
      duration: 0.15,
      ease: "bounce.out",
    });
    
  }, [thrownCardAnimation, gameState.myPlayerIndex, gameState.players.length]);

  // GSAP: Wizard effect animation - target discards and draws new card
  useLayoutEffect(() => {
    if (!wizardEffectAnimation) return;
    
    const { targetPlayerIndex, targetPlayerName, discardedCardValue, discardedCardId } = wizardEffectAnimation;
    const isTargetMe = targetPlayerIndex === gameState.myPlayerIndex;
    
    // Get card data from cardsMap
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    const cardTypeKey = `Value${discardedCardValue}` as CardType;
    const cardInfo = cardConcept.cards[cardTypeKey];
    
    if (!cardInfo) {
      setWizardEffectAnimation(null);
      return;
    }
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Card size
    const cardHeight = 160;
    const cardWidth = Math.round((cardHeight * 2) / 3);
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize);
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize);
    
    // Calculate target player position
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
        if (opponentIdx === 0) {
          playerX = 100;
          playerY = viewportHeight / 2;
        } else {
          playerX = viewportWidth - 100;
          playerY = viewportHeight / 2;
        }
      } else {
        if (opponentIdx === 0) {
          playerX = 100;
          playerY = viewportHeight / 2;
        } else if (opponentIdx === 1) {
          playerX = viewportWidth / 2;
          playerY = 100;
        } else {
          playerX = viewportWidth - 100;
          playerY = viewportHeight / 2;
        }
      }
    }
    
    // Discard pile position (center of table)
    const discardX = viewportWidth / 2 + 80;
    const discardY = viewportHeight * 0.4;
    
    // Deck position (center of table, left of discard)
    const deckX = viewportWidth / 2 - 80;
    const deckY = viewportHeight * 0.4;
    
    // === Animation 1: Target's card flies to discard ===
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
    
    // === Animation 2: New card flies from deck to target ===
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
    
    // Create master timeline
    const masterTl = gsap.timeline({
      onComplete: () => {
        discardedCard.remove();
        newCardElement.remove();
        // Reveal the discarded card in discard pile
        setHiddenDiscardCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(discardedCardId);
          return newSet;
        });
        setWizardEffectAnimation(null);
      },
    });
    
    // Phase 1: Discarded card appears and flies to discard pile
    masterTl.to(discardedCard, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    
    masterTl.to(discardedCard, {
      left: discardX,
      top: discardY,
      rotation: gsap.utils.random(-15, 15),
      duration: 0.5,
      ease: "power2.inOut",
    });
    
    masterTl.to(discardedCard, {
      opacity: 0,
      scale: 0.8,
      duration: 0.2,
      ease: "power2.in",
    });
    
    // Phase 2: New card appears from deck and flies to player
    masterTl.to(newCardElement, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    }, "-=0.1");
    
    masterTl.to(newCardElement, {
      left: playerX,
      top: playerY,
      rotation: 0,
      duration: 0.5,
      ease: "power2.out",
    });
    
    masterTl.to(newCardElement, {
      scale: 1.1,
      duration: 0.1,
      ease: "power2.out",
    });
    
    masterTl.to(newCardElement, {
      scale: 1,
      duration: 0.15,
      ease: "bounce.out",
    });
    
    masterTl.to(newCardElement, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      delay: 0.3,
      ease: "power2.in",
    });
    
  }, [wizardEffectAnimation, gameState.myPlayerIndex, gameState.players.length]);

  // Detect when new cards are drawn and trigger animation
  useEffect(() => {
    if (!humanPlayer) return;
    
    const currentHand = humanPlayer.hand;
    const prevHand = prevHandCardsRef.current;
    const currentHandLength = currentHand.length;
    
    // Skip animation on initial page load
    if (isInitialLoadRef.current) {
      // Initialize refs with current state
      prevHandLength.current = currentHandLength;
      prevHandCardsRef.current = [...currentHand];
      isInitialLoadRef.current = false;
      return;
    }
    
    // Check if cards were drawn (hand grew)
    if (currentHandLength > prevHandLength.current) {
      // Find the new cards by comparing IDs
      const prevIds = new Set(prevHand.map((c: GameCard) => c.id));
      const newCards = currentHand.filter((c: GameCard) => !prevIds.has(c.id));
      
      if (newCards.length > 0) {
        // Check if it's a round start (no previous cards)
        const isRoundStart = prevHandLength.current === 0;
        
        // Hide new cards until animation completes
        setHiddenDrawnCards(prev => {
          const newSet = new Set(prev);
          newCards.forEach((c: GameCard) => newSet.add(c.id));
          return newSet;
        });
        
        setDrawCardAnimation({
          drawnCards: newCards,
          isRoundStart,
        });
      }
    }
    
    // Update refs
    prevHandLength.current = currentHandLength;
    prevHandCardsRef.current = [...currentHand];
  }, [humanPlayer, humanPlayer?.hand]);
  
  // GSAP: Draw card animation - card slides from deck to hand, then flips to reveal
  useLayoutEffect(() => {
    if (!drawCardAnimation) return;
    
    const { drawnCards, isRoundStart } = drawCardAnimation;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Deck position (center of table)
    const deckX = viewportWidth / 2 - 80;
    const deckY = viewportHeight * 0.4;
    
    // Player's hand position (bottom center, slightly to the right)
    const handY = viewportHeight - 120;
    const handXOffset = 80; // Offset to the right
    
    // Get card data from cardsMap
    const cardConcept = cardsMap[CardConceptType.RelicOfLies];
    
    // Card size for animation - match "sm" size in CardCharacter (200px height, aspect 2:3)
    const cardHeight = 200;
    const cardWidth = Math.round((cardHeight * 2) / 3); // ~133px
    
    // Font sizes matching CardCharacter sm size
    const valueFontSize = Math.round(cardHeight * cardConcept.valueFontSize);
    const nameFontSize = Math.round(cardHeight * cardConcept.nameFontSize);
    const descriptionFontSize = Math.round(cardHeight * cardConcept.descriptionFontSize);
    
    // Animate each drawn card
    drawnCards.forEach((card: GameCard, index: number) => {
      const cardTypeKey = `Value${card.value}` as CardType;
      const cardInfo = cardConcept.cards[cardTypeKey];
      
      if (!cardInfo) return;
      
      // Calculate target X position (offset to the right)
      const totalCards = drawnCards.length;
      const spacing = 150;
      const baseX = viewportWidth / 2 + handXOffset;
      const startX = baseX - ((totalCards - 1) * spacing) / 2;
      const targetX = startX + index * spacing;
      
      // Create animated card element with flip container
      const animatedCard = document.createElement('div');
      animatedCard.className = 'fixed z-[100] pointer-events-none';
      animatedCard.style.willChange = 'transform, left, top';
      animatedCard.style.perspective = '1000px';
      animatedCard.innerHTML = `
        <div class="card-flip-inner" style="width: ${cardWidth}px; height: ${cardHeight}px; transform-style: preserve-3d; position: relative;">
          <!-- Card Back -->
          <div class="absolute inset-0 rounded-lg overflow-hidden" style="backface-visibility: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <img src="${cardConcept.cardBack}" alt="Card Back" class="w-full h-full object-cover" />
          </div>
          <!-- Card Front with value, name, and description -->
          <div class="absolute inset-0 rounded-lg overflow-hidden" style="backface-visibility: hidden; transform: rotateY(180deg); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <img src="${cardInfo.image}" alt="${cardInfo.name}" class="absolute inset-0 w-full h-full object-contain z-0" />
            <img src="${cardConcept.frame}" alt="Frame" class="absolute inset-0 w-full h-full object-cover z-10" />
            <span class="absolute z-20 drop-shadow-lg" style="color: #d2ac77; top: 1.8%; left: 10.5%; font-size: ${valueFontSize}px; font-family: var(--font-faith-collapsing), serif; font-weight: bold;">${cardInfo.value}</span>
            <span class="absolute z-20 truncate" style="color: #402716; top: 3.3%; left: 60%; transform: translateX(-50%); font-size: ${nameFontSize}px; font-family: var(--font-god-of-war), serif; max-width: 70%; font-weight: bold;">${cardInfo.name}</span>
            <span class="absolute z-20 text-center left-1/2 -translate-x-1/2" style="color: rgba(0,0,0,0.8); bottom: 10%; font-size: ${descriptionFontSize}px; font-family: var(--font-helvetica), sans-serif; width: 72%; font-weight: 600; line-height: 1.2;">${cardInfo.description}</span>
          </div>
        </div>
      `;
      
      // Initial position at deck
      animatedCard.style.left = `${deckX}px`;
      animatedCard.style.top = `${deckY}px`;
      animatedCard.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(animatedCard);
      
      const flipInner = animatedCard.querySelector('.card-flip-inner') as HTMLElement;
      
      // Delay for stagger effect at round start
      const staggerDelay = isRoundStart ? index * 0.2 : 0;
      
      // Timeline for slide then flip
      const tl = gsap.timeline({ delay: staggerDelay });
      
      // Phase 1: Slide from deck to hand
      tl.to(animatedCard, {
        left: targetX,
        top: handY,
        duration: 0.5,
        ease: "power3.out",
      });
      
      // Phase 2: Flip card to reveal
      tl.to(flipInner, {
        rotateY: 180,
        duration: 0.4,
        ease: "power2.inOut",
      });
      
      // Phase 3: Fade out quickly and reveal the actual card
      tl.to(animatedCard, {
        opacity: 0,
        duration: 0.15,
        delay: 0.2,
        ease: "power2.in",
        onComplete: () => {
          animatedCard.remove();
          
          // Reveal this card in hand
          setHiddenDrawnCards(prev => {
            const newSet = new Set(prev);
            newSet.delete(card.id);
            return newSet;
          });
          
          // Clear animation state after last card
          if (index === drawnCards.length - 1) {
            setDrawCardAnimation(null);
          }
        },
      });
    });
    
  }, [drawCardAnimation]);
  
  // Detect round end and show winner
  useEffect(() => {
    // Only trigger when game phase changes to roundEnd
    if (gameState.gamePhase === 'roundEnd' && prevGamePhaseRef.current !== 'roundEnd') {
      // Find the winner(s) - players who are still alive
      const alivePlayers = gameState.players
        .map((p: Player, idx: number) => ({ player: p, index: idx }))
        .filter((item: { player: Player; index: number }) => !item.player.isEliminated);
      
      if (alivePlayers.length === 1) {
        // Single winner - last one standing
        const winner = alivePlayers[0];
        const cardInHand = winner.player.hand[0];
        setRoundWinner({
          playerIndex: winner.index,
          playerName: winner.player.name,
          reason: 'Last one standing!',
          cardValue: cardInHand?.value,
        });
      } else if (alivePlayers.length > 1) {
        // Multiple alive - compare cards (showdown)
        let highestValue = -1;
        let winner: { player: Player; index: number } | null = null;
        
        for (const item of alivePlayers) {
          const cardInHand = item.player.hand[0];
          if (cardInHand && cardInHand.value > highestValue) {
            highestValue = cardInHand.value;
            winner = item;
          }
        }
        
        if (winner) {
          setRoundWinner({
            playerIndex: winner.index,
            playerName: winner.player.name,
            reason: `Highest card (${highestValue})!`,
            cardValue: highestValue,
          });
        }
      }
    }
    
    // Clear winner when new round starts
    if (gameState.gamePhase === 'playing' && prevGamePhaseRef.current === 'roundEnd') {
      setRoundWinner(null);
    }
    
    prevGamePhaseRef.current = gameState.gamePhase;
  }, [gameState.gamePhase, gameState.players]);

  // GSAP: Turn indicator pulse animation
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

  // GSAP: Header entrance animation
  useLayoutEffect(() => {
    if (!headerRef.current) return;
    
    gsap.fromTo(headerRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, []);

  // GSAP: Round change celebration - AFTER round state updates
  useLayoutEffect(() => {
    if (prevRoundRef.current !== 0 && gameState.roundNumber !== prevRoundRef.current) {
      // New round started - flash effect with delay
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
        
        // Also shake the header
        if (headerRef.current) {
          gsap.fromTo(headerRef.current, 
            { scale: 1 },
            { 
              scale: 1.1, 
              duration: 0.3,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut",
            }
          );
        }
      }, 200);
    }
    prevRoundRef.current = gameState.roundNumber;
  }, [gameState.roundNumber]);

  // GSAP: Play button hover animation
  useLayoutEffect(() => {
    if (!playButtonRef.current) return;
    
    const button = playButtonRef.current;
    
    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
    };
    
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [selectedCard]);

  // Map card value to CardType enum
  const mapCardValueToCardType = (cardValue: number): CardType => {
    const cardTypeMap: Record<number, CardType> = {
      0: CardType.Value0,
      1: CardType.Value1,
      2: CardType.Value2,
      3: CardType.Value3,
      4: CardType.Value4,
      5: CardType.Value5,
      6: CardType.Value6,
      7: CardType.Value7,
      8: CardType.Value8,
      9: CardType.Value9,
    };
    return cardTypeMap[cardValue] || CardType.Value0;
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 transition-colors duration-500 relative overflow-hidden">

        <div className="relative z-10 flex flex-col h-screen">
          {/* Header - Top Left */}
          <div ref={headerRef} className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400">{room.name}</h1>
            <div className="flex items-center gap-4 text-sm text-amber-300">
              <span>Round {gameState.roundNumber}</span>
            </div>
            <Button variant="ghost" onClick={() => router.push('/rooms')} className="text-amber-400 hover:text-amber-300 justify-start">
              Back to Lobby
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
                  .map((p: Player, idx: number) => [idx, p.hand.length] as [number, number])
                  .filter(([idx]: [number, number]) => Number(idx) !== gameState.myPlayerIndex)
              )}
              deckCount={gameState.deckCount}
              discardCount={gameState.discardPile.filter((c: GameCard) => !hiddenDiscardCards.has(c.id)).length}
              discardPile={gameState.discardPile.filter((c: GameCard) => !hiddenDiscardCards.has(c.id))}
              showStartRoundButton={gameState.gamePhase === 'roundEnd' && room.status === 2 && room.players.length >= 2}
              onStartRound={handleStartRound}
              isStartingRound={isStartingRound}
              isGameEnd={gameState.gamePhase === 'gameEnd'}
              onStartNewGame={handleStartRound}
              winnerName={gameState.gamePhase === 'gameEnd' 
                ? gameState.players.find((p: Player) => p.hearts >= gameState.heartsToWin)?.name || null
                : null}
              onViewDiscard={() => setShowDiscardModal(true)}
              roundWinner={roundWinner}
            />
          </div>

          {/* Chancellor Choice UI */}
          {humanPlayer && gameState.gamePhase === 'chancellorChoice' && gameState.chancellorCards.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-4 z-30 pointer-events-none">
              <div className="pointer-events-auto flex flex-col gap-4 backdrop-blur-sm rounded-lg p-4 border border-amber-600/50">
                <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-amber-400">Chancellor: </h3>
                
                {/* Back and Confirm buttons - Only show when in step 2 */}
                {chancellorKeepCard && chancellorReturnOrder.length >= 1 && (
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
                      onClick={async () => {
                        if (chancellorKeepCard && chancellorReturnOrder.length >= 1) {
                          try {
                            await resolveChancellor(
                              roomId,
                              chancellorKeepCard.value,
                              chancellorReturnOrder.map((c: GameCard) => c.value),
                              room
                            );
                            setChancellorKeepCard(null);
                            setChancellorReturnOrder([]);
                            fetchRoom();
                          } catch (err) {
                            // Error is handled by the hook
                          }
                        }
                      }}
                      disabled={!chancellorKeepCard || chancellorReturnOrder.length < 1 || isProcessingAction}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-2"
                    >
                      {isProcessingAction ? 'Processing...' : 'Confirm'}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Step 1: Choose card to keep */}
              {!chancellorKeepCard && (
                <div>
                  <p className="text-amber-300 font-semibold mb-3 text-center">Choose card to keep:</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {gameState.chancellorCards.map((card: GameCard) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          setChancellorKeepCard(card);
                          const returnCards = gameState.chancellorCards.filter((c: GameCard) => c.id !== card.id);
                          setChancellorReturnOrder(returnCards);
                        }}
                        className="cursor-pointer transition-all hover:scale-105"
                      >
                        <GameCardComponent
                          card={card}
                          size="small"
                          faceUp
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2a: Single card return (deck had only 1 card) */}
              {chancellorKeepCard && chancellorReturnOrder.length === 1 && (
                <div className="flex gap-6">
                  {/* Left side - Keep card */}
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-amber-300 font-semibold mb-2">Keep:</p>
                    <div className="mt-auto">
                      <GameCardComponent
                        card={chancellorKeepCard}
                        size="small"
                        faceUp
                      />
                    </div>
                  </div>

                  {/* Right side - Return card */}
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-amber-300 font-semibold mb-2">Return to deck:</p>
                    <div className="mt-auto">
                      {chancellorReturnOrder[0] && (
                        <GameCardComponent
                          card={chancellorReturnOrder[0]}
                          size="small"
                          faceUp
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2b: Arrange return order (normal case - 2 cards to return) */}
              {chancellorKeepCard && chancellorReturnOrder.length === 2 && (
                <div className="flex gap-6">
                  {/* Left side - Keep card */}
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-amber-300 font-semibold">Keep:</p>
                    <div className="mt-auto">
                      <GameCardComponent
                        card={chancellorKeepCard}
                        size="small"
                        faceUp
                      />
                    </div>
                  </div>

                  {/* Right side - Arrange return order */}
                  <div className="flex-1 flex flex-col items-center">
                    <p className="text-amber-300 font-semibold">Return order:</p>
                    
                    {/* Return order cards - Top (left) and Bottom (right) */}
                    <div className="flex items-center gap-3 mt-auto">
                      {/* Top - Left side */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-amber-400/70 font-semibold">Top</span>
                        {chancellorReturnOrder[1] && (
                          <div
                            onClick={() => {
                              if (chancellorReturnOrder[0] && chancellorReturnOrder[1]) {
                                setChancellorReturnOrder([chancellorReturnOrder[1], chancellorReturnOrder[0]]);
                              }
                            }}
                            className="cursor-pointer transition-all hover:scale-105"
                          >
                            <GameCardComponent
                              card={chancellorReturnOrder[1]}
                              size="small"
                              faceUp
                            />
                          </div>
                        )}
                      </div>

                      {/* Swap button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (chancellorReturnOrder[0] && chancellorReturnOrder[1]) {
                            setChancellorReturnOrder([chancellorReturnOrder[1], chancellorReturnOrder[0]]);
                          }
                        }}
                        className="p-2 rounded-lg border-2 border-amber-600 hover:border-amber-400 bg-slate-700/50 hover:bg-slate-700 transition-all"
                        title="Swap"
                      >
                        <span className="text-amber-400 text-xl">⇅</span>
                      </button>

                      {/* Bottom - Right side */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-amber-400/70 font-semibold">Bottom</span>
                        {chancellorReturnOrder[0] && (
                          <div
                            onClick={() => {
                              if (chancellorReturnOrder[0] && chancellorReturnOrder[1]) {
                                setChancellorReturnOrder([chancellorReturnOrder[1], chancellorReturnOrder[0]]);
                              }
                            }}
                            className="cursor-pointer transition-all hover:scale-105"
                          >
                            <GameCardComponent
                              card={chancellorReturnOrder[0]}
                              size="small"
                              faceUp
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* Cards - Display at bottom without container */}
          {humanPlayer && gameState.gamePhase === 'playing' && (
            <>
              {/* Countess Rule Warning */}
              {mustPlayCountess && isMyTurn && (
                <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 z-20 animate-pulse">
                  <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg border-2 border-red-400">
                    ⚠️ You have Countess with King/Prince - You MUST play Countess!
                  </div>
                </div>
              )}

              {/* Cards - Horizontal layout at bottom center */}
              <div 
                ref={cardsContainerRef}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 justify-center flex-wrap z-10"
              >
                {humanPlayer.hand.filter((c: GameCard) => !hiddenDrawnCards.has(c.id)).map((card: GameCard) => {
                  const isSelected = selectedCardId === card.id;
                  // If mustPlayCountess, only Countess (8) can be selected
                  const isCountess = card.value === 8;
                  const canSelect = isMyTurn && !isProcessingAction && (!mustPlayCountess || isCountess);
                  
                  const handleCardClick = () => {
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
                      setSelectedTarget(null);
                      setSelectedGuess(null);
                    }
                  };
                  
                  return (
                    <div
                      key={card.id}
                      className={cn(
                        "game-card-item",
                        mustPlayCountess && !isCountess && 'grayscale'
                      )}
                    >
                      <GameCardComponent
                        card={card}
                        size="small"
                        faceUp
                        selected={isSelected}
                        disabled={!canSelect}
                        onClick={handleCardClick}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Card description and PLAY Button - Right side */}
              {selectedCard && (
                <div className="absolute bottom-4 left-1/2 translate-x-[152px] h-[200px] flex flex-col justify-between items-start z-20">
                  {/* PLAY Button - Top */}
                  {isMyTurn && (
                    (() => {
                      // Check if card requires target
                      const requiresTarget = cardRequiresTarget(selectedCard);
                      const requiresGuess = cardRequiresGuess(selectedCard);
                      
                      // Get valid targets
                      const validTargets = selectedCard ? getValidTargets() : [];
                      const hasValidTargets = validTargets.length > 0;
                      
                      // For Prince (5), can always target self
                      const canTargetSelf = selectedCard?.value === 5;
                      
                      // Determine if button should be disabled
                      let isDisabled = isProcessingAction;
                      
                      if (requiresTarget) {
                        // If card requires target:
                        // - Disable if no target selected (including Prince - must explicitly select)
                        // - Allow if no valid targets AND cannot target self (can skip)
                        if (selectedTarget === null) {
                          if (hasValidTargets || canTargetSelf) {
                            // Has valid targets or can target self - must select one
                            isDisabled = true;
                          } else {
                            // No valid targets and cannot target self - allow play (skip)
                            isDisabled = false;
                          }
                        } else {
                          // Target selected
                          if (requiresGuess) {
                            // Guard also needs guess
                            isDisabled = selectedGuess === null;
                          } else {
                            isDisabled = false;
                          }
                        }
                      } else if (requiresGuess) {
                        // Card only requires guess (shouldn't happen, but just in case)
                        isDisabled = selectedGuess === null;
                      }
                      
                      return (
                        <Button
                          ref={playButtonRef}
                          onClick={handlePlayCard}
                          disabled={isDisabled}
                          className="relative overflow-hidden bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-slate-900 font-bold py-4 px-8 text-lg rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_0_0_#92400e,0_6px_20px_rgba(245,158,11,0.4)] hover:shadow-[0_2px_0_0_#92400e,0_4px_15px_rgba(245,158,11,0.5)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none border-2 border-amber-400/50"
                          style={{ fontFamily: 'var(--font-god-of-war), serif' }}
                        >
                          <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]">
                            {isProcessingAction ? '⚔️ Playing...' : '⚔️ PLAY'}
                          </span>
                        </Button>
                      );
                    })()
                  )}
                  
                  {/* Card description - Bottom */}
                  <div className="text-sm text-amber-300 bg-slate-900/90 px-2 py-1 rounded border border-amber-600/50 max-w-[220px] whitespace-normal">
                    {selectedCard.description}
                  </div>
                </div>
              )}

              {/* Priest Reveal Modal */}
              {revealedCard && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in cursor-pointer"
                  onClick={() => setRevealedCard(null)}
                >
                  <div 
                    className="flex flex-col items-center gap-4 rounded-lg p-6 animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
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
                </div>
              )}

              {/* Baron Comparison Modal */}
              {baronComparison && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in cursor-pointer"
                  onClick={() => setBaronComparison(null)}
                >
                  <div 
                    className="flex flex-col items-center gap-6 rounded-lg p-6 animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-xl font-bold text-amber-400">Baron Comparison</h3>
                    
                    {/* Cards comparison */}
                    <div className="flex items-center gap-8">
                      {/* My card */}
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-amber-300 font-semibold">You</p>
                        <div className={cn(
                          "relative rounded-lg p-1",
                          baronComparison.result === 'win' && "ring-4 ring-green-400",
                          baronComparison.result === 'lose' && "ring-4 ring-red-400",
                          baronComparison.result === 'tie' && "ring-4 ring-yellow-400"
                        )}>
                          <CardCharacter
                            cardType={mapCardValueToCardType(baronComparison.myCard.value)}
                            size="sm"
                            flip={true}
                          />
                        </div>
                        <p className="text-sm text-amber-300">{baronComparison.myCard.name}</p>
                        <p className="text-lg font-bold text-amber-400">Value: {baronComparison.myCard.value}</p>
                      </div>

                      {/* VS */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-bold text-amber-500">VS</span>
                        <div className={cn(
                          "px-4 py-2 rounded-lg font-bold text-lg",
                          baronComparison.result === 'win' && "bg-green-500/20 text-green-400",
                          baronComparison.result === 'lose' && "bg-red-500/20 text-red-400",
                          baronComparison.result === 'tie' && "bg-yellow-500/20 text-yellow-400"
                        )}>
                          {baronComparison.result === 'win' && '🎉 WIN!'}
                          {baronComparison.result === 'lose' && '💀 LOSE'}
                          {baronComparison.result === 'tie' && '🤝 TIE'}
                        </div>
                      </div>

                      {/* Opponent card */}
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-amber-300 font-semibold">
                          {baronComparison.opponentAddress.slice(0, 6)}...{baronComparison.opponentAddress.slice(-4)}
                        </p>
                        <div className={cn(
                          "relative rounded-lg p-1",
                          baronComparison.result === 'lose' && "ring-4 ring-green-400",
                          baronComparison.result === 'win' && "ring-4 ring-red-400",
                          baronComparison.result === 'tie' && "ring-4 ring-yellow-400"
                        )}>
                          <CardCharacter
                            cardType={mapCardValueToCardType(baronComparison.opponentCard.value)}
                            size="sm"
                            flip={true}
                          />
                        </div>
                        <p className="text-sm text-amber-300">{baronComparison.opponentCard.name}</p>
                        <p className="text-lg font-bold text-amber-400">Value: {baronComparison.opponentCard.value}</p>
                      </div>
                    </div>

                    <p className="text-xs text-amber-400/50">
                      Click anywhere or wait to close
                    </p>
                  </div>
                </div>
              )}

              {/* Guess Selection (Guard) */}
              {isMyTurn && selectedCard?.value === 1 && selectedTarget !== null && (
                <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 z-10">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {[0, 2, 3, 4, 5, 6, 7, 8, 9].map(cardValue => {
                      const cardData = CARD_DATA_MAP[cardValue];
                      if (!cardData) return null;
                      return (
                        <button
                          key={cardValue}
                          type="button"
                          onClick={() => setSelectedGuess(selectedGuess === cardValue ? null : cardValue)}
                          className={`px-2 py-1 text-xs rounded border-2 transition-all ${
                            selectedGuess === cardValue
                              ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                              : 'border-amber-600/50 hover:border-amber-400 text-amber-400'
                          }`}
                        >
                          {cardData.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


            </>
          )}

          {/* Discard Pile Modal - Rendered at top level to avoid z-index issues */}
          {showDiscardModal && (() => {
            const visibleDiscardPile = gameState.discardPile.filter((c: GameCard) => !hiddenDiscardCards.has(c.id));
            return (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
              onClick={() => setShowDiscardModal(false)}
            >
              <div 
                className="rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto animate-scale-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center items-center mb-4 min-w-56">
                  <h3 className="text-xl font-bold text-amber-400">Discarded Cards ({visibleDiscardPile.length})</h3>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {visibleDiscardPile.map((card: GameCard) => {
                    const cardData = CARD_DATA_MAP[card.value];
                    return (
                      <div
                        key={card.id}
                        className="flex flex-col items-center gap-1"
                      >
                        <CardCharacter
                          cardType={mapCardValueToCardType(card.value)}
                          size="xs"
                        />
                        <span className="text-xs text-amber-400 font-medium">{cardData?.name || 'Unknown'}</span>
                      </div>
                    );
                  })}
                </div>
                {visibleDiscardPile.length === 0 && (
                  <p className="text-center text-amber-400/70 mt-4">No cards discarded yet</p>
                )}
                {/* Click anywhere hint */}
                <p className="text-center text-amber-400/50 text-xs mt-6">Click anywhere to close</p>
              </div>
            </div>
            );
          })()}
        </div>

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