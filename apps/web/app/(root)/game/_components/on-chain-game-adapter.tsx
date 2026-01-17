'use client';

import { type ActionPhase, type GameCard, type Player } from '@/components/game/game-context';
import { Button } from '@/components/ui/button';
import { GameTable } from '@/components/game-table';
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
  const [selectedCardValue, setSelectedCardValue] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [chancellorKeepCard, setChancellorKeepCard] = useState<GameCard | null>(null);
  const [chancellorReturnOrder, setChancellorReturnOrder] = useState<GameCard[]>([]);

  const humanPlayer = gameState.players.find((p: Player) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && !currentPlayer.isBot && gameState.gamePhase === 'playing';
  
  // Find selected card object from hand (based on value, not id, to persist across re-renders)
  const selectedCard = selectedCardValue ? humanPlayer?.hand.find((c: GameCard) => c.value === selectedCardValue) || null : null;
  
  // Check card count - display cards that player currently has on chain
  const hasOneCard = humanPlayer && humanPlayer.hand.length === 1;
  const hasTwoCards = humanPlayer && humanPlayer.hand.length === 2;

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
    if (!selectedCardValue || !selectedCard) return;
    
    try {
      await playTurn(
        roomId,
        selectedCard.value,
        selectedTarget,
        selectedGuess
      );
      setSelectedCardValue(null);
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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 transition-colors duration-500 relative overflow-hidden">

        <div className="relative z-10 flex flex-col h-screen">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-3 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400">{room.name}</h1>
            <div className="flex items-center gap-4 text-sm text-amber-300">
              <span>Round {gameState.roundNumber}</span>
              <span>•</span>
              <span>Pot: {(Number(room.pot.value) / 1_000_000_000).toFixed(3)} SUI</span>
            </div>
            <Button variant="ghost" onClick={() => router.push('/rooms')} className="text-amber-400 hover:text-amber-300 mt-2">
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
              selectedCardValue={selectedCardValue}
              opponentCards={Object.fromEntries(
                gameState.players
                  .map((p: Player, idx: number) => [idx, p.hand.length] as [number, number])
                  .filter(([idx]: [number, number]) => Number(idx) !== gameState.myPlayerIndex)
              )}
              deckCount={gameState.deckCount}
              discardCount={gameState.discardPile.length}
              discardPile={gameState.discardPile}
              showStartRoundButton={gameState.gamePhase === 'roundEnd' && room.status === 2 && room.players.length >= 2}
              onStartRound={handleStartRound}
              isStartingRound={isStartingRound}
              isGameEnd={gameState.gamePhase === 'gameEnd'}
            />
          </div>

          {/* Chancellor Choice UI */}
          {humanPlayer && gameState.gamePhase === 'chancellorChoice' && gameState.chancellorCards.length > 0 && (
            <div className="w-full bg-slate-800 border-2 border-amber-600 rounded-lg p-4 flex-shrink-0 flex flex-col gap-4 mx-3 mb-3 max-h-[70vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-amber-400 text-center">Chancellor - Choose a card to keep</h3>
              
              {/* Step 1: Choose card to keep */}
              {!chancellorKeepCard && (
                <div>
                  <p className="text-amber-300 font-semibold mb-3 text-center">Select a card to keep:</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    {gameState.chancellorCards.map((card: GameCard) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => {
                          setChancellorKeepCard(card);
                          const returnCards = gameState.chancellorCards.filter((c: GameCard) => c.id !== card.id);
                          setChancellorReturnOrder(returnCards);
                        }}
                        className="p-4 rounded-lg border-2 transition-all hover:scale-105 border-amber-600/50 hover:border-amber-400 bg-slate-700/50"
                      >
                        <p className="font-bold text-amber-400 text-base">{card.name}</p>
                        <p className="text-xs text-amber-300/70 mt-1">{card.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Arrange return order */}
              {chancellorKeepCard && chancellorReturnOrder.length === 2 && (
                <div>
                  <p className="text-amber-300 font-semibold mb-2 text-center">
                    Arrange the order of 2 cards to return to bottom of deck:
                  </p>
                  <p className="text-xs text-amber-400/70 mb-4 text-center">
                    Click the swap button or click on a card to change the order
                  </p>
                  <div className="flex flex-col items-center gap-3">
                    {/* Card order display */}
                    <div className="flex items-center gap-4">
                      {/* First card position (Bottom of deck - return last) */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-amber-400 font-semibold">Bottom of Deck</span>
                        <span className="text-xs text-amber-400/70">(Return Last)</span>
                        {chancellorReturnOrder[0] && (
                          <button
                            type="button"
                            onClick={() => {
                              if (chancellorReturnOrder[0] && chancellorReturnOrder[1]) {
                                setChancellorReturnOrder([chancellorReturnOrder[1], chancellorReturnOrder[0]]);
                              }
                            }}
                            className="p-3 rounded-lg border-2 border-amber-400 bg-amber-400/20 transition-all hover:scale-105 min-w-[100px]"
                          >
                            <p className="font-bold text-amber-400 text-sm">{chancellorReturnOrder[0].name}</p>
                            <p className="text-xs text-amber-300/70 mt-1">Value: {chancellorReturnOrder[0].value}</p>
                          </button>
                        )}
                      </div>

                      {/* Swap button */}
                      <div className="flex flex-col items-center gap-1 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            if (chancellorReturnOrder[0] && chancellorReturnOrder[1]) {
                              setChancellorReturnOrder([chancellorReturnOrder[1], chancellorReturnOrder[0]]);
                            }
                          }}
                          className="p-2 rounded-lg border-2 border-amber-600 hover:border-amber-400 bg-slate-700/50 hover:bg-slate-700 transition-all"
                          title="Swap order"
                        >
                          <span className="text-amber-400 text-xl">⇅</span>
                        </button>
                        <span className="text-xs text-amber-400/70">Swap</span>
                      </div>

                      {/* Second card position (Top - return first) */}
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-amber-400 font-semibold">Top (Return First)</span>
                        <span className="text-xs text-amber-400/70">Above Bottom</span>
                        {chancellorReturnOrder[1] && (
                          <button
                            type="button"
                            onClick={() => {
                              if (chancellorReturnOrder[0] && chancellorReturnOrder[1]) {
                                setChancellorReturnOrder([chancellorReturnOrder[1], chancellorReturnOrder[0]]);
                              }
                            }}
                            className="p-3 rounded-lg border-2 border-amber-400 bg-amber-400/20 transition-all hover:scale-105 min-w-[100px]"
                          >
                            <p className="font-bold text-amber-400 text-sm">{chancellorReturnOrder[1].name}</p>
                            <p className="text-xs text-amber-300/70 mt-1">Value: {chancellorReturnOrder[1].value}</p>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Selected card to keep */}
                    <div className="mt-4 p-3 rounded-lg border-2 border-green-500 bg-green-500/10">
                      <p className="text-xs text-green-400 mb-1">Card to keep:</p>
                      <p className="font-bold text-green-400">{chancellorKeepCard.name}</p>
                    </div>

                    {/* Confirm button */}
                    <Button
                      onClick={async () => {
                        if (chancellorKeepCard && chancellorReturnOrder.length === 2) {
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
                      disabled={!chancellorKeepCard || chancellorReturnOrder.length !== 2 || isProcessingAction}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-3"
                    >
                      {isProcessingAction ? 'Processing...' : 'Confirm & Return Cards'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cards - Display at bottom without container */}
          {humanPlayer && gameState.gamePhase === 'playing' && (
            <>
              {/* Cards - Horizontal layout at bottom center */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 justify-center flex-wrap z-10">
                {humanPlayer.hand.map((card: GameCard) => {
                  const isSelected = selectedCardValue === card.value;
                  const canSelect = isMyTurn && !isProcessingAction;
                  
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canSelect) {
                          setSelectedCardValue(isSelected ? null : card.value);
                        }
                      }}
                      disabled={!canSelect}
                      className={`w-20 h-28 rounded-lg font-bold text-base transition-all transform ${
                        isSelected
                          ? 'ring-4 ring-amber-400 scale-105 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900'
                          : !isMyTurn || isProcessingAction
                            ? 'opacity-50 cursor-not-allowed bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-2 border-amber-600/30 text-amber-400/50'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-amber-400 text-amber-400 hover:scale-105'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1 h-full justify-center">
                        <span className="text-xl">{card.name.slice(0, 1)}</span>
                        <span className="text-sm">{card.value}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Card description and PLAY Button - Right side */}
              {selectedCard && (
                <div className="absolute bottom-4 left-1/2 translate-x-[140px] flex flex-col gap-2 items-start z-20">
                  {/* PLAY Button */}
                  {isMyTurn && (
                    (() => {
                      const canPlay = 
                        (!cardRequiresTarget(selectedCard) && !cardRequiresGuess(selectedCard)) ||
                        (cardRequiresTarget(selectedCard) && selectedTarget !== null && !cardRequiresGuess(selectedCard)) ||
                        (cardRequiresGuess(selectedCard) && selectedTarget !== null && selectedGuess !== null);
                      
                        return (
                          <Button
                            onClick={handlePlayCard}
                            disabled={isProcessingAction || !canPlay}
                            className="from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                          >
                            {isProcessingAction ? 'Playing...' : 'PLAY'}
                          </Button>
                        );
                      return null;
                    })()
                  )}
                  
                  {/* Card description */}
                  <div className="text-xs text-amber-300 bg-slate-900/90 px-2 py-1 rounded border border-amber-600/50 max-w-[200px] whitespace-normal">
                    {selectedCard.description}
                  </div>
                </div>
              )}

              {/* Guess Selection (Guard) */}
              {isMyTurn && selectedCard?.value === 1 && selectedTarget !== null && (
                <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10">
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