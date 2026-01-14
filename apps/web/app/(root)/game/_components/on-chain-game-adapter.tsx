'use client';

import { type ActionPhase, type GameCard, type Player } from '@/components/game/game-context';
import { Button } from '@/components/ui/button';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    useGetRoom,
    usePlayTurn,
    useResolveChancellor,
    useStartRound,
    type GameRoomType,
} from '@/hooks/use-game-contract';
import { useRouter } from 'next/navigation';

// Card data mapping
const CARD_DATA_MAP: Record<number, Omit<GameCard, "id">> = {
  0: { type: "spy", name: "Spy", value: 0, description: "At round end, if only you played or discarded a Spy, gain 1 token.", count: 2 },
  1: { type: "guard", name: "Guard", value: 1, description: "Name a card (except Guard). If that target holds it, they are eliminated.", count: 6 },
  2: { type: "priest", name: "Priest", value: 2, description: "Choose and privately look at another player's hand.", count: 2 },
  3: { type: "baron", name: "Baron", value: 3, description: "Privately compare hands with another player. Lower card is eliminated.", count: 2 },
  4: { type: "handmaid", name: "Handmaid", value: 4, description: "You are immune to all card effects until your next turn.", count: 2 },
  5: { type: "prince", name: "Prince", value: 5, description: "Choose any player. They discard their card and draw a new one.", count: 2 },
  6: { type: "chancellor", name: "Chancellor", value: 6, description: "Draw 2 cards, keep 1, return 2 to bottom of deck.", count: 2 },
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
      createCard(cardValue, `player-${idx}-hand-${cardIdx}-${Date.now()}`)
    );
    const discardedCards = p.discarded.map((cardValue, cardIdx) => 
      createCard(cardValue, `player-${idx}-discarded-${cardIdx}-${Date.now()}`)
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

  // Convert deck
  const deck: GameCard[] = room.deck.map((cardValue, idx) => 
    createCard(cardValue, `deck-${idx}-${Date.now()}`)
  );

  // Convert discard pile
  const discardPile: GameCard[] = [];
  room.players.forEach((p, playerIdx) => {
    p.discarded.forEach((cardValue, cardIdx) => {
      discardPile.push(createCard(cardValue, `discard-${playerIdx}-${cardIdx}-${Date.now()}`));
    });
  });

  // Removed cards
  const removedCards: GameCard[] = [];
  if (room.burn_card !== null && room.burn_card !== undefined) {
    removedCards.push(createCard(Number(room.burn_card), `burn-card-${Date.now()}`));
  }
  room.public_cards.forEach((cardValue, idx) => {
    removedCards.push(createCard(cardValue, `public-${idx}-${Date.now()}`));
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

  const chancellorCards = room.chancellor_cards.map((cardValue, idx) => 
    createCard(cardValue, `chancellor-${idx}-${Date.now()}`)
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
  };

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

  if (isLoading && !room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4">Loading game...</p>
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
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [chancellorKeepCard, setChancellorKeepCard] = useState<GameCard | null>(null);

  const humanPlayer = gameState.players.find((p: Player) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && !currentPlayer.isBot && gameState.gamePhase === 'playing';

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
        // Can't target self (except Prince)
        if (selectedCard.value !== 5 && index === gameState.myPlayerIndex) return false;
        // Can't target eliminated players
        if (player.isEliminated) return false;
        // Can't target immune players
        if (player.isProtected) return false;
        return true;
      });
  }, [selectedCard, gameState.myPlayerIndex, gameState.players]);

  const handlePlayCard = async () => {
    if (!selectedCard) return;
    
    try {
      await playTurn(
        roomId,
        selectedCard.value,
        selectedTarget,
        selectedGuess
      );
      setSelectedCard(null);
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

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-cream dark:bg-midnight transition-colors duration-500 relative overflow-hidden">
        {/* Background overlays - same as game components */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10 pointer-events-none bg-[url('/subtle-parchment-texture-with-faint-rose-patterns.jpg')] bg-repeat" />
        <div className="absolute inset-0 opacity-5 dark:opacity-5 pointer-events-none bg-[url('/delicate-vintage-rose-floral-pattern-seamless.jpg')] bg-repeat" />

        <div className="relative z-10 flex flex-col h-screen">
          {/* TopBar styled header */}
          <header className="h-16 bg-crimson/90 dark:bg-midnight-deep/90 backdrop-blur-sm border-b border-gold/30 dark:border-silver/30 px-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/20 dark:bg-silver/20 flex items-center justify-center">
                <span className="text-2xl">💌</span>
              </div>
              <div>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-gold dark:text-silver tracking-wide italic">
                  {room.name}
                </h1>
                <p className="text-xs text-gold/70 dark:text-silver/70">
                  Round {gameState.roundNumber} • Pot: {(Number(room.pot.value) / 1_000_000_000).toFixed(3)} SUI
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => router.push('/rooms')} className="text-cream dark:text-silver">
              Back to Lobby
            </Button>
          </header>

          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 flex flex-col items-center justify-between gap-4 p-4 overflow-hidden">
              {/* PlayArea - deck and discard */}
              <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                  {/* Deck */}
                  <div className="relative">
                    <div className="relative w-24 h-36 md:w-28 md:h-40 rounded-lg bg-gradient-to-br from-crimson via-crimson-dark to-crimson-deeper dark:from-midnight dark:via-midnight-deep dark:to-midnight-deeper border-2 border-gold dark:border-silver shadow-xl">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold/20 dark:bg-silver/20 border-2 border-gold dark:border-silver flex items-center justify-center">
                          <span className="text-2xl md:text-3xl">💌</span>
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold dark:bg-silver text-crimson-dark dark:text-midnight font-bold flex items-center justify-center shadow-lg">
                        {gameState.deckCount}
                      </div>
                    </div>
                    <p className="text-center mt-2 text-sm text-crimson-dark dark:text-silver-light font-medium">
                      Draw Deck
                    </p>
                  </div>

                  {/* Discard Pile */}
                  <div className="relative">
                    <div className="relative w-24 h-36 md:w-28 md:h-40 rounded-lg border-2 border-dashed border-gold/30 dark:border-silver/30 flex items-center justify-center">
                      <span className="text-gold/30 dark:text-silver/30 text-sm">
                        {gameState.discardPile.length > 0 ? gameState.discardPile.length : 'Empty'}
                      </span>
                    </div>
                    <p className="text-center mt-2 text-sm text-crimson-dark dark:text-silver-light font-medium">
                      Discard ({gameState.discardPile.length})
                    </p>
                  </div>
                </div>
              </div>

              {/* PlayersZone */}
              <div className="w-full px-2 py-4">
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
                  {gameState.players.map((player: Player, index: number) => {
                    const isActivePlayer = index === gameState.currentPlayerIndex && !player.isEliminated;
                    return (
                      <div
                        key={player.id}
                        className={`relative flex flex-col items-center p-3 md:p-4 rounded-2xl transition-all duration-300 min-w-[120px] md:min-w-[140px] ${
                          isActivePlayer ? 'ring-2 ring-gold dark:ring-silver shadow-lg' : ''
                        } ${player.isEliminated ? 'opacity-60' : ''} bg-cream/50 dark:bg-midnight-light/50`}
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-3 border-gold dark:border-silver mb-2">
                          <div className="w-full h-full bg-gold/20 dark:bg-silver/20 flex items-center justify-center">
                            <span className="text-2xl">👤</span>
                          </div>
                        </div>
                        <p className="font-semibold text-crimson-dark dark:text-silver">{player.name}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: player.hearts }, (_, i) => (
                            <span key={`heart-${player.id}-${i}`} className="text-red-500">❤️</span>
                          ))}
                        </div>
                        {player.isProtected && (
                          <span className="text-xs text-blue-500 mt-1">🛡️ Protected</span>
                        )}
                        {player.isEliminated && (
                          <span className="text-xs text-red-500 mt-1">💀 Eliminated</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </main>

            {/* PlayerHUD - hand and actions */}
            {humanPlayer && gameState.gamePhase === 'playing' && (
              <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-crimson/95 dark:bg-midnight-deep/95 backdrop-blur-sm border-t border-gold/30 dark:border-silver/30">
                <div className="max-w-4xl mx-auto">
                  {gameState.gamePhase === 'chancellorChoice' && gameState.chancellorCards.length > 0 ? (
                    <div>
                      <p className="text-foreground mb-4">Choose a card to keep:</p>
                      <div className="flex gap-4 mb-4">
                        {gameState.chancellorCards.map((card: GameCard) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => setChancellorKeepCard(card)}
                            className={`p-4 rounded-lg border-2 ${
                              chancellorKeepCard?.id === card.id
                                ? 'border-gold bg-gold/20'
                                : 'border-gold/50 hover:border-gold'
                            }`}
                          >
                            <p className="font-bold text-foreground">{card.name}</p>
                          </button>
                        ))}
                      </div>
                      <Button
                        onClick={async () => {
                          if (chancellorKeepCard) {
                            const returnCards = gameState.chancellorCards.filter((c: GameCard) => c.id !== chancellorKeepCard.id);
                            await resolveChancellor(roomId, chancellorKeepCard.value, returnCards.map((c: GameCard) => c.value));
                            setChancellorKeepCard(null);
                            fetchRoom();
                          }
                        }}
                        disabled={!chancellorKeepCard}
                      >
                        Confirm
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground mb-4">Your Hand:</p>
                      <div className="flex gap-4 mb-4 flex-wrap">
                        {humanPlayer.hand.map((card: GameCard) => (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => isMyTurn && setSelectedCard(selectedCard?.id === card.id ? null : card)}
                            disabled={!isMyTurn}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedCard?.id === card.id
                                ? 'border-gold bg-gold/20'
                                : isMyTurn
                                  ? 'border-gold/50 hover:border-gold cursor-pointer'
                                  : 'border-gold/30 opacity-50'
                            }`}
                          >
                            <p className="font-bold text-foreground">{card.name}</p>
                            <p className="text-sm text-foreground/70">Value: {card.value}</p>
                          </button>
                        ))}
                      </div>
                      {/* Target Selection */}
                      {isMyTurn && selectedCard && cardRequiresTarget(selectedCard) && (
                        <div className="mb-4">
                          <p className="text-foreground mb-2">Select Target:</p>
                          <div className="flex gap-2 flex-wrap">
                            {getValidTargets().map(({ player, index }: { player: Player; index: number }) => (
                              <button
                                key={`target-${player.id}-${index}`}
                                type="button"
                                onClick={() => setSelectedTarget(selectedTarget === index ? null : index)}
                                className={`px-3 py-1 rounded border-2 transition-all ${
                                  selectedTarget === index
                                    ? 'border-gold bg-gold/20'
                                    : 'border-gold/50 hover:border-gold'
                                }`}
                              >
                                <span className="text-foreground">{player.name}</span>
                              </button>
                            ))}
                            {getValidTargets().length === 0 && (
                              <p className="text-foreground/70">No valid targets (all immune)</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Guess Selection (Guard) */}
                      {isMyTurn && selectedCard?.value === 1 && selectedTarget !== null && (
                        <div className="mb-4">
                          <p className="text-foreground mb-2">Guess a card (not Guard):</p>
                          <div className="flex gap-2 flex-wrap">
                            {[0, 2, 3, 4, 5, 6, 7, 8, 9].map(cardValue => {
                              const cardData = CARD_DATA_MAP[cardValue];
                              if (!cardData) return null;
                              return (
                                <button
                                  key={cardValue}
                                  type="button"
                                  onClick={() => setSelectedGuess(selectedGuess === cardValue ? null : cardValue)}
                                  className={`px-3 py-1 rounded border-2 transition-all ${
                                    selectedGuess === cardValue
                                      ? 'border-gold bg-gold/20'
                                      : 'border-gold/50 hover:border-gold'
                                  }`}
                                >
                                  <span className="text-foreground">{cardData.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Play Button */}
                      {isMyTurn && selectedCard && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={handlePlayCard} 
                            disabled={
                              isProcessingAction ||
                              (cardRequiresTarget(selectedCard) && selectedTarget === null && getValidTargets().length > 0) ||
                              (cardRequiresGuess(selectedCard) && selectedGuess === null)
                            }
                          >
                            {isProcessingAction ? 'Playing...' : 'Play Card'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
