'use client';

import { type ActionPhase, type GameCard, type Player } from '@/components/game/game-context';
import { Button } from '@/components/ui/button';
import { GameTable } from '@/components/game-table';
import { GameCardComponent } from '@/components/game/game-card';
import { CardCharacter } from '@/components/common/game-ui/cards/card-character';
import { CardType } from '@/components/common/game-ui/cards/types';
import { cn } from '@/lib/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
    useGetRoomV3,
    usePlayTurnV3,
    useResolveChancellorV3,
    useStartRoundV3,
    useDecryptCards,
    useRespondGuardV3,
    useRespondBaronV3,
    usePendingActionV3,
    useChancellorStateV3,
    type SealedGameRoomType,
    type DecryptedCard,
    CardNames,
    PendingActionTypeConst,
} from '@/hooks/use-sealed-game-contract';
import { useRouter } from 'next/navigation';
import { Lock, Eye, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

// Convert sealed room to game state
function convertSealedRoomToGameState(
  room: SealedGameRoomType,
  currentAccount: string,
  decryptedCards: DecryptedCard[]
) {
  const myPlayerIndex = room.players.findIndex(p => p.addr === currentAccount);
  const currentPlayerIndex = room.status === 1 ? (Number(room.current_turn) % room.players.length) : 0;

  // Create a map of decrypted cards by index
  const decryptedMap = new Map<number, DecryptedCard>();
  decryptedCards.forEach(dc => decryptedMap.set(dc.cardIndex, dc));

  // Convert players
  const players: Player[] = room.players.map((p, idx) => {
    // For my player, use decrypted cards; for others, show hidden cards
    const isMe = idx === myPlayerIndex;
    
    const hand: GameCard[] = p.hand.map((cardIdx, handIdx) => {
      const cardIndex = Number(cardIdx);
      if (isMe) {
        const decrypted = decryptedMap.get(cardIndex);
        if (decrypted) {
          return createCard(decrypted.value, `player-${idx}-hand-${handIdx}-idx-${cardIndex}`);
        }
      }
      // For opponents or undeckrypted cards, create hidden card
      return {
        id: `player-${idx}-hand-${handIdx}-idx-${cardIndex}-hidden`,
        type: "unknown" as any,
        name: "Hidden",
        value: -1, // Hidden
        description: "Card is encrypted",
        count: 1,
      };
    });

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
      playedSpy: p.has_played_spy || p.discarded.includes(0),
    };
  });

  // Deck count
  const deckCount = room.deck_indices.length;

  // Convert discard pile
  const discardPile: GameCard[] = [];
  room.players.forEach((p, playerIdx) => {
    p.discarded.forEach((cardValue, cardIdx) => {
      discardPile.push(createCard(cardValue, `discard-${playerIdx}-${cardIdx}-${Date.now()}`));
    });
  });

  // Removed cards (public cards for 2-player)
  const removedCards: GameCard[] = room.public_cards.map((cardValue, idx) => 
    createCard(cardValue, `public-${idx}-${Date.now()}`)
  );

  // Game phase
  let gamePhase: 'setup' | 'playing' | 'roundEnd' | 'gameEnd' | 'chancellorChoice' | 'pendingResponse' = 'setup';
  if (room.status === 0) {
    gamePhase = 'setup';
  } else if (room.status === 1) {
    if (room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx)) {
      gamePhase = 'chancellorChoice';
    } else if (room.pending_action !== null) {
      gamePhase = 'pendingResponse';
    } else {
      gamePhase = 'playing';
    }
  } else if (room.status === 2) {
    gamePhase = 'roundEnd';
  } else if (room.status === 3) {
    gamePhase = 'gameEnd';
  }

  // Chancellor cards (decrypted)
  const chancellorCardIndices = room.chancellor_card_indices.map(c => Number(c));
  const chancellorCards = chancellorCardIndices.map((cardIdx, idx) => {
    const decrypted = decryptedMap.get(cardIdx);
    if (decrypted) {
      return createCard(decrypted.value, `chancellor-${idx}-idx-${cardIdx}`);
    }
    return {
      id: `chancellor-${idx}-idx-${cardIdx}-hidden`,
      type: "unknown" as any,
      name: "Hidden",
      value: -1,
      description: "Decrypting...",
      count: 1,
    };
  });

  return {
    players,
    deck: [],
    discardPile,
    removedCards,
    deckCount,
    currentPlayerIndex,
    gamePhase,
    roundNumber: room.round_number,
    heartsToWin: room.tokens_to_win,
    myPlayerIndex,
    chancellorCards,
    chancellorCardIndices,
  };
}

interface SealedGameAdapterProps {
  roomId: string;
}

export function SealedGameAdapter({ roomId }: SealedGameAdapterProps) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { room, fetchRoom, isLoading, error } = useGetRoomV3(roomId);
  const { startRound, isPending: isStartingRound } = useStartRoundV3();
  const { playTurn, isPending: isPlayingTurn } = usePlayTurnV3();
  const { resolveChancellor, isPending: isResolvingChancellor } = useResolveChancellorV3();
  const { respondGuard, isPending: isRespondingGuard } = useRespondGuardV3();
  const { respondBaron, isPending: isRespondingBaron } = useRespondBaronV3();
  const { decryptCards, decryptedCards, isDecrypting } = useDecryptCards();

  const [isDarkMode] = useState(false);
  const [resultNotification, setResultNotification] = useState<{ type: 'success' | 'failure' | 'info' | 'neutral'; title: string; message: string } | null>(null);
  const [isWalletChecked, setIsWalletChecked] = useState(false);

  // Check wallet connection status
  useEffect(() => {
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

  // Decrypt cards when room updates
  useEffect(() => {
    if (!room || !currentAccount) return;
    
    const myPlayerIndex = room.players.findIndex(p => p.addr === currentAccount.address);
    if (myPlayerIndex === -1) return;

    const myPlayer = room.players[myPlayerIndex];
    if (!myPlayer) return;
    const cardIndicesToDecrypt = myPlayer.hand.map(h => Number(h));
    
    // Also decrypt chancellor cards if pending
    if (room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx)) {
      room.chancellor_card_indices.forEach(c => {
        const idx = Number(c);
        if (!cardIndicesToDecrypt.includes(idx)) {
          cardIndicesToDecrypt.push(idx);
        }
      });
    }

    if (cardIndicesToDecrypt.length > 0) {
      decryptCards(room, cardIndicesToDecrypt);
    }
  }, [room, currentAccount, decryptCards]);

  // Convert on-chain room to game state
  const gameState = useMemo(() => {
    if (!room || !currentAccount?.address) return null;
    return convertSealedRoomToGameState(room, currentAccount.address, decryptedCards);
  }, [room, currentAccount, decryptedCards]);

  // Pending action state
  const pendingAction = usePendingActionV3(room);
  const chancellorState = useChancellorStateV3(room);

  // Handle start round
  const handleStartRound = async () => {
    try {
      await startRound(roomId);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: 'failure',
        title: 'Failed to Start Round',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  // Show loading while checking wallet
  if (!isWalletChecked || (isLoading && !room)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto" />
          <p className="mt-4 text-violet-300">Loading sealed game...</p>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-violet-400">Wallet Not Connected</h1>
          <p className="text-muted-foreground mt-2">Please connect your wallet to play.</p>
          <Button onClick={() => router.push('/rooms_v3')} className="mt-4 bg-violet-600 hover:bg-violet-700">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (error || !room || !gameState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-muted-foreground mt-2">{error?.message || 'Room not found'}</p>
          <Button onClick={() => router.push('/rooms_v3')} className="mt-4 bg-violet-600 hover:bg-violet-700">
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
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950/30 to-slate-900 flex items-center justify-center relative overflow-hidden">
          <div className="text-center z-10 px-4 max-w-md">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-8 h-8 text-violet-500" />
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
                {room.name}
              </h1>
            </div>
            <Badge variant="outline" className="mb-4 border-violet-500 text-violet-400">
              <Shield className="w-3 h-3 mr-1" />
              Seal Encrypted Game
            </Badge>
            <p className="text-violet-300/80 text-lg mb-8">
              Waiting for players ({room.players.length}/{room.max_players})
            </p>
            {canStartRound && (
              <Button 
                onClick={handleStartRound}
                disabled={isStartingRound}
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {isStartingRound ? 'Starting Round...' : 'Start Round'}
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => router.push('/rooms_v3')}
              className="mt-4 w-full border-violet-500 text-violet-400 hover:bg-violet-500/20"
            >
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SealedGameWithUI
      room={room}
      roomId={roomId}
      gameState={gameState}
      decryptedCards={decryptedCards}
      isDarkMode={isDarkMode}
      isProcessingAction={isPlayingTurn || isResolvingChancellor || isStartingRound || isRespondingGuard || isRespondingBaron}
      isDecrypting={isDecrypting}
      playTurn={playTurn}
      resolveChancellor={resolveChancellor}
      respondGuard={respondGuard}
      respondBaron={respondBaron}
      resultNotification={resultNotification}
      setResultNotification={setResultNotification}
      fetchRoom={fetchRoom}
      router={router}
      handleStartRound={handleStartRound}
      isStartingRound={isStartingRound}
      pendingAction={pendingAction}
      chancellorState={chancellorState}
    />
  );
}

// Main game UI component
function SealedGameWithUI({
  room,
  roomId,
  gameState,
  decryptedCards,
  isDarkMode,
  isProcessingAction,
  isDecrypting,
  playTurn,
  resolveChancellor,
  respondGuard,
  respondBaron,
  resultNotification,
  setResultNotification,
  fetchRoom,
  router,
  handleStartRound,
  isStartingRound,
  pendingAction,
  chancellorState,
}: any) {
  const currentAccount = useCurrentAccount();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [chancellorKeepIndex, setChancellorKeepIndex] = useState<number | null>(null);
  const [chancellorReturnIndices, setChancellorReturnIndices] = useState<number[]>([]);

  // Create a map of decrypted cards
  const decryptedMap = useMemo(() => {
    const map = new Map<number, DecryptedCard>();
    decryptedCards.forEach((dc: DecryptedCard) => map.set(dc.cardIndex, dc));
    return map;
  }, [decryptedCards]);

  const humanPlayer = gameState.players.find((p: Player) => !p.isBot);
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer && !currentPlayer.isBot && gameState.gamePhase === 'playing';

  // Get selected decrypted card
  const selectedDecryptedCard = selectedCardIndex !== null ? decryptedMap.get(selectedCardIndex) : null;

  // Check Countess rule
  const mustPlayCountess = useMemo(() => {
    if (!humanPlayer || humanPlayer.hand.length < 2) return false;
    
    let hasCountess = false;
    let hasKingOrPrince = false;
    
    humanPlayer.hand.forEach((card: GameCard) => {
      const cardIdx = parseInt(card.id.split('-idx-')[1]?.split('-')[0] || '-1');
      const decrypted = decryptedMap.get(cardIdx);
      if (decrypted) {
        if (decrypted.value === 8) hasCountess = true;
        if (decrypted.value === 7 || decrypted.value === 5) hasKingOrPrince = true;
      }
    });
    
    return hasCountess && hasKingOrPrince;
  }, [humanPlayer, decryptedMap]);

  // Check if card requires target
  const cardRequiresTarget = (value: number): boolean => {
    return [1, 2, 3, 5, 7].includes(value);
  };

  const cardRequiresGuess = (value: number): boolean => {
    return value === 1;
  };

  // Get valid targets
  const getValidTargets = useCallback(() => {
    if (!selectedDecryptedCard || gameState.myPlayerIndex < 0) return [];
    
    const cardValue = selectedDecryptedCard.value;
    return gameState.players
      .map((p: Player, idx: number) => ({ player: p, index: idx }))
      .filter((item: { player: Player; index: number }) => {
        const { player, index } = item;
        const isSelf = index === gameState.myPlayerIndex;
        
        if (cardValue !== 5 && isSelf) return false;
        if (player.isEliminated) return false;
        if (player.isProtected && !(cardValue === 5 && isSelf)) return false;
        return true;
      });
  }, [selectedDecryptedCard, gameState.myPlayerIndex, gameState.players]);

  // Handle play card
  const handlePlayCard = async () => {
    if (selectedCardIndex === null || !selectedDecryptedCard) return;
    
    try {
      let targetToUse = selectedTarget;
      
      if (selectedDecryptedCard.value === 5 && targetToUse === null && gameState.myPlayerIndex >= 0) {
        targetToUse = gameState.myPlayerIndex;
      }
      
      await playTurn(
        roomId,
        selectedCardIndex,
        selectedDecryptedCard.value,
        selectedDecryptedCard.secret,
        targetToUse,
        selectedGuess
      );
      
      setSelectedCardIndex(null);
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

  // Handle Guard response
  const handleRespondGuard = async () => {
    if (!pendingAction.isResponder || !humanPlayer) return;
    
    const myCardIdx = humanPlayer.hand[0]?.id.split('-idx-')[1]?.split('-')[0];
    if (!myCardIdx) return;
    
    const cardIndex = parseInt(myCardIdx);
    const decrypted = decryptedMap.get(cardIndex);
    if (!decrypted) return;

    try {
      await respondGuard(roomId, cardIndex, decrypted.value, decrypted.secret);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: 'failure',
        title: 'Failed to Respond',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  // Handle Baron response
  const handleRespondBaron = async () => {
    if (!pendingAction.isResponder || !humanPlayer) return;
    
    const myCardIdx = humanPlayer.hand[0]?.id.split('-idx-')[1]?.split('-')[0];
    if (!myCardIdx) return;
    
    const cardIndex = parseInt(myCardIdx);
    const decrypted = decryptedMap.get(cardIndex);
    if (!decrypted) return;

    try {
      await respondBaron(roomId, cardIndex, decrypted.value, decrypted.secret);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: 'failure',
        title: 'Failed to Respond',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  // Handle Chancellor resolve
  const handleResolveChancellor = async () => {
    if (chancellorKeepIndex === null || chancellorReturnIndices.length < 1) return;

    try {
      await resolveChancellor(roomId, chancellorKeepIndex, chancellorReturnIndices, room);
      setChancellorKeepIndex(null);
      setChancellorReturnIndices([]);
      fetchRoom();
    } catch (err) {
      setResultNotification({
        type: 'failure',
        title: 'Failed to Resolve Chancellor',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

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
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900 transition-colors duration-500 relative overflow-hidden">

        <div className="relative z-10 flex flex-col h-screen">
          {/* Header */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-violet-400">{room.name}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-violet-300">
              <span>Round {gameState.roundNumber}</span>
              <Badge variant="outline" className="border-violet-500 text-violet-400">
                <Shield className="w-3 h-3 mr-1" />
                Sealed
              </Badge>
              {isDecrypting && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-400 animate-pulse">
                  <Eye className="w-3 h-3 mr-1" />
                  Decrypting...
                </Badge>
              )}
            </div>
            <Button variant="ghost" onClick={() => router.push('/rooms_v3')} className="text-violet-400 hover:text-violet-300 justify-start">
              Back to Lobby
            </Button>
          </div>

          {/* Pending Action Alert */}
          {pendingAction.hasPendingAction && pendingAction.isResponder && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-yellow-400">Action Required</span>
                </div>
                {pendingAction.pendingAction?.action_type === PendingActionTypeConst.GUARD_RESPONSE && (
                  <>
                    <p className="text-sm text-yellow-300 mb-3">
                      Someone played Guard and guessed your card. You must reveal it.
                    </p>
                    <Button 
                      onClick={handleRespondGuard}
                      disabled={isProcessingAction}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isProcessingAction ? 'Revealing...' : 'Reveal Card'}
                    </Button>
                  </>
                )}
                {pendingAction.pendingAction?.action_type === PendingActionTypeConst.BARON_RESPONSE && (
                  <>
                    <p className="text-sm text-yellow-300 mb-3">
                      Baron comparison! Reveal your card to compare.
                    </p>
                    <Button 
                      onClick={handleRespondBaron}
                      disabled={isProcessingAction}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isProcessingAction ? 'Revealing...' : 'Reveal for Comparison'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Game Table */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <GameTable
              playerCount={gameState.players.length}
              players={gameState.players}
              currentPlayerIndex={gameState.currentPlayerIndex}
              myPlayerIndex={gameState.myPlayerIndex}
              selectedTarget={selectedTarget}
              onSelectTarget={(targetId: number) => setSelectedTarget(targetId)}
              isSelectingTarget={isMyTurn && selectedDecryptedCard !== null && selectedDecryptedCard !== undefined && cardRequiresTarget(selectedDecryptedCard.value)}
              selectedCardValue={selectedDecryptedCard?.value || null}
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
              onStartNewGame={handleStartRound}
              winnerName={gameState.gamePhase === 'gameEnd' 
                ? gameState.players.find((p: Player) => p.hearts >= gameState.heartsToWin)?.name || null
                : null}
            />
          </div>

          {/* Chancellor Choice UI */}
          {chancellorState.isPending && chancellorState.isChancellorPlayer && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-4 z-30">
              <div className="flex flex-col gap-4 backdrop-blur-sm rounded-lg p-4 border border-violet-600/50 bg-slate-900/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-violet-400">Chancellor: Choose card to keep</h3>
                  
                  {chancellorKeepIndex !== null && chancellorReturnIndices.length >= 1 && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setChancellorKeepIndex(null);
                          setChancellorReturnIndices([]);
                        }}
                        variant="outline"
                        className="border-violet-600 text-violet-400"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleResolveChancellor}
                        disabled={isProcessingAction}
                        className="bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        {isProcessingAction ? 'Processing...' : 'Confirm'}
                      </Button>
                    </div>
                  )}
                </div>
                
                {chancellorKeepIndex === null && (
                  <div className="flex gap-3 justify-center flex-wrap">
                    {chancellorState.cardIndices.map((cardIdx: number) => {
                      const decrypted = decryptedMap.get(cardIdx);
                      if (!decrypted) {
                        return (
                          <div key={cardIdx} className="w-20 h-28 bg-slate-700 rounded animate-pulse flex items-center justify-center">
                            <Eye className="w-6 h-6 text-violet-400 animate-pulse" />
                          </div>
                        );
                      }
                      return (
                        <div
                          key={cardIdx}
                          onClick={() => {
                            setChancellorKeepIndex(cardIdx);
                            const returnCards = chancellorState.cardIndices.filter((c: number) => c !== cardIdx);
                            setChancellorReturnIndices(returnCards);
                          }}
                          className="cursor-pointer transition-all hover:scale-105"
                        >
                          <GameCardComponent
                            card={createCard(decrypted.value, `chancellor-${cardIdx}`)}
                            size="small"
                            faceUp
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {chancellorKeepIndex !== null && (
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <p className="text-violet-300 font-semibold mb-2">Keep:</p>
                      {decryptedMap.get(chancellorKeepIndex) && (
                        <GameCardComponent
                          card={createCard(decryptedMap.get(chancellorKeepIndex)!.value, `keep-${chancellorKeepIndex}`)}
                          size="small"
                          faceUp
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-violet-300 font-semibold mb-2">Return to deck:</p>
                      <div className="flex gap-2">
                        {chancellorReturnIndices.map((cardIdx: number) => {
                          const decrypted = decryptedMap.get(cardIdx);
                          if (!decrypted) return null;
                          return (
                            <GameCardComponent
                              key={cardIdx}
                              card={createCard(decrypted.value, `return-${cardIdx}`)}
                              size="small"
                              faceUp
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Player's Cards */}
          {humanPlayer && gameState.gamePhase === 'playing' && !pendingAction.isResponder && (
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 justify-center flex-wrap z-10">
                {humanPlayer.hand.map((card: GameCard, idx: number) => {
                  const cardIdxStr = card.id.split('-idx-')[1]?.split('-')[0];
                  const cardIdx = cardIdxStr ? parseInt(cardIdxStr) : -1;
                  const decrypted = decryptedMap.get(cardIdx);
                  const isSelected = selectedCardIndex === cardIdx;
                  
                  // Check if this is Countess when mustPlayCountess
                  const isCountess = decrypted?.value === 8;
                  const canSelect = isMyTurn && !isProcessingAction && (!mustPlayCountess || isCountess) && decrypted;
                  
                  if (!decrypted) {
                    return (
                      <div key={card.id} className="w-20 h-28 bg-slate-700/50 rounded-lg animate-pulse flex items-center justify-center border border-violet-500/30">
                        <Eye className="w-6 h-6 text-violet-400 animate-pulse" />
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        if (canSelect) {
                          setSelectedCardIndex(isSelected ? null : cardIdx);
                          if (!isSelected) {
                            if (!cardRequiresTarget(decrypted.value)) {
                              setSelectedTarget(null);
                            }
                            if (!cardRequiresGuess(decrypted.value)) {
                              setSelectedGuess(null);
                            }
                          } else {
                            setSelectedTarget(null);
                            setSelectedGuess(null);
                          }
                        }
                      }}
                      className={cn(
                        "transition-all transform",
                        canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                        mustPlayCountess && !isCountess && 'grayscale'
                      )}
                    >
                      <GameCardComponent
                        card={createCard(decrypted.value, card.id)}
                        size="small"
                        faceUp
                        selected={isSelected}
                        disabled={!canSelect}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Card description and PLAY Button */}
              {selectedDecryptedCard && (
                <div className="absolute bottom-4 left-1/2 translate-x-[152px] h-[200px] flex flex-col justify-between items-start z-20">
                  {isMyTurn && (
                    (() => {
                      const requiresTarget = cardRequiresTarget(selectedDecryptedCard.value);
                      const requiresGuess = cardRequiresGuess(selectedDecryptedCard.value);
                      const validTargets = getValidTargets();
                      const hasValidTargets = validTargets.length > 0;
                      const canTargetSelf = selectedDecryptedCard.value === 5;
                      
                      let isDisabled = isProcessingAction;
                      
                      if (requiresTarget) {
                        if (selectedTarget === null) {
                          if (hasValidTargets || canTargetSelf) {
                            isDisabled = true;
                          }
                        } else {
                          if (requiresGuess) {
                            isDisabled = selectedGuess === null;
                          }
                        }
                      }
                      
                      return (
                        <Button
                          onClick={handlePlayCard}
                          disabled={isDisabled}
                          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-4 px-6 text-lg rounded-lg"
                        >
                          {isProcessingAction ? 'Playing...' : 'PLAY'}
                        </Button>
                      );
                    })()
                  )}
                  
                  <div className="text-sm text-violet-300 bg-slate-900/90 px-2 py-1 rounded border border-violet-600/50 max-w-[220px] whitespace-normal">
                    {CARD_DATA_MAP[selectedDecryptedCard.value]?.description || 'Unknown card'}
                  </div>
                </div>
              )}

              {/* Guess Selection (Guard) */}
              {isMyTurn && selectedDecryptedCard?.value === 1 && selectedTarget !== null && (
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
                              ? 'border-violet-400 bg-violet-400/20 text-violet-300'
                              : 'border-violet-600/50 hover:border-violet-400 text-violet-400'
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
