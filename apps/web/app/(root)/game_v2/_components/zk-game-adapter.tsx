'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useGetRoom,
  useJoinRoom,
  useStartRound,
  usePlayTurn,
  useRespondGuard,
  useRespondBaron,
  useRespondPrince,
  useRespondKing,
  useResolveChancellor,
  useHandleTimeout,
  useIsMyTurn,
  usePlayerIndex,
  useHasPendingAction,
  usePendingAction,
  useIsDealer,
  GameStatus,
  CardType,
  CardNames,
  ActionType,
  BaronResult,
} from '@/hooks/use-game-contract-v2';
import { useRouter } from 'next/navigation';

// ZK Crypto utilities - inline for now to avoid module issues
interface PlayerSecrets {
  cards: number[];
  salts: number[];
}

interface DealerSecrets {
  deck: number[];
  playerCards: Map<string, number[]>;
  salts: Map<string, number[]>;
}

const COMMITMENT_SIZE = 32;

const ZKCryptoUtils = {
  generateSalt(): number {
    return Math.floor(Math.random() * 2 ** 32);
  },

  generateCommitment(card: number, salt: number): number[] {
    const commitment = new Array(COMMITMENT_SIZE).fill(0);
    const combined = card * 1000000 + (salt % 1000000);
    for (let i = 0; i < COMMITMENT_SIZE; i++) {
      commitment[i] = (combined * (i + 1) * 17) % 256;
    }
    return commitment;
  },

  generateShuffledDeck(): number[] {
    const deck: number[] = [];
    const cardCounts: Record<number, number> = {
      0: 2, 1: 6, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 1, 8: 1, 9: 1,
    };
    for (const [card, count] of Object.entries(cardCounts)) {
      for (let i = 0; i < count; i++) {
        deck.push(parseInt(card));
      }
    }
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = deck[i];
      deck[i] = deck[j] as number;
      deck[j] = temp as number;
    }
    return deck;
  },

  generateDeckCommitment(deck: number[]): number[] {
    const commitment = new Array(COMMITMENT_SIZE).fill(0);
    let hash = 0;
    for (let i = 0; i < deck.length; i++) {
      hash = (hash * 31 + (deck[i] ?? 0)) % (2 ** 32);
    }
    for (let i = 0; i < COMMITMENT_SIZE; i++) {
      commitment[i] = (hash * (i + 1) * 13) % 256;
    }
    return commitment;
  },

  generateDealerSecrets(playerAddresses: string[]): {
    deckCommitment: number[];
    playerCommitments: number[][];
    publicCards: number[];
    secrets: DealerSecrets;
  } {
    const deck = this.generateShuffledDeck();
    const playerCards = new Map<string, number[]>();
    const salts = new Map<string, number[]>();
    const playerCommitments: number[][] = [];

    deck.shift(); // burn card

    const publicCards: number[] = [];
    if (playerAddresses.length === 2) {
      for (let i = 0; i < 3; i++) {
        const card = deck.shift();
        if (card !== undefined) publicCards.push(card);
      }
    }

    for (const address of playerAddresses) {
      const card = deck.shift();
      if (card !== undefined) {
        const salt = this.generateSalt();
        playerCards.set(address, [card]);
        salts.set(address, [salt]);
        const commitment = this.generateCommitment(card, salt);
        playerCommitments.push(commitment);
      }
    }

    const deckCommitment = this.generateDeckCommitment(deck);

    return {
      deckCommitment,
      playerCommitments,
      publicCards,
      secrets: { deck, playerCards, salts },
    };
  },

  generateGuardProof(card: number, salt: number, guess: number, isCorrect: boolean): number[] {
    const proof = new Array(256).fill(0);
    const combined = card * 1000 + salt % 1000 + guess * 10 + (isCorrect ? 1 : 0);
    for (let i = 0; i < proof.length; i++) {
      proof[i] = (combined * (i + 1) * 23) % 256;
    }
    return proof;
  },

  generateBaronProof(myCard: number, mySalt: number, opponentCard: number, result: number): number[] {
    const proof = new Array(256).fill(0);
    const combined = myCard * 10000 + mySalt % 1000 + opponentCard * 10 + result;
    for (let i = 0; i < proof.length; i++) {
      proof[i] = (combined * (i + 1) * 29) % 256;
    }
    return proof;
  },
};

// Card data for display
const CARD_DATA: Record<number, { name: string; description: string }> = {
  0: { name: "Spy", description: "At round end, if only you played/discarded a Spy, gain 1 token." },
  1: { name: "Guard", description: "Name a card (except Guard). If target holds it, they are eliminated." },
  2: { name: "Priest", description: "Privately look at another player's hand." },
  3: { name: "Baron", description: "Compare hands with another player. Lower card is eliminated." },
  4: { name: "Handmaid", description: "You are immune until your next turn." },
  5: { name: "Prince", description: "Choose any player. They discard and draw a new card." },
  6: { name: "Chancellor", description: "Draw 2 cards, keep 1, return 2 to deck." },
  7: { name: "King", description: "Trade hands with another player." },
  8: { name: "Countess", description: "Must be discarded if you have King or Prince." },
  9: { name: "Princess", description: "If discarded, you are eliminated." },
};

interface ZKGameAdapterProps {
  roomId: string;
}

export function ZKGameAdapter({ roomId }: ZKGameAdapterProps) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { room, fetchRoom, isLoading, error } = useGetRoom(roomId);
  const { joinRoom, isPending: isJoining } = useJoinRoom();
  const { startRound, isPending: isStartingRound } = useStartRound();
  const { playTurn, isPending: isPlayingTurn } = usePlayTurn();
  const { respondGuard, isPending: isRespondingGuard } = useRespondGuard();
  const { respondBaron, isPending: isRespondingBaron } = useRespondBaron();
  const { respondPrince, isPending: isRespondingPrince } = useRespondPrince();
  const { respondKing, isPending: isRespondingKing } = useRespondKing();
  const { resolveChancellor, isPending: isResolvingChancellor } = useResolveChancellor();
  const { handleTimeout, isPending: isHandlingTimeout } = useHandleTimeout();

  // Game state hooks
  const isMyTurn = useIsMyTurn(room);
  const myPlayerIndex = usePlayerIndex(room);
  const hasPendingAction = useHasPendingAction(room);
  const pendingAction = usePendingAction(room);
  const isDealer = useIsDealer(room);

  // Local state
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isWalletChecked, setIsWalletChecked] = useState(false);

  // ZK-specific state - Player's secret cards (stored locally, not on-chain)
  const [playerSecrets, setPlayerSecrets] = useState<PlayerSecrets | null>(null);
  const [dealerSecrets, setDealerSecrets] = useState<{
    deck: number[];
    playerCards: Map<string, number[]>;
    salts: Map<string, number[]>;
  } | null>(null);

  // Check wallet connection
  useEffect(() => {
    const timer = setTimeout(() => setIsWalletChecked(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch room data periodically
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Get my player data
  const myPlayer = useMemo(() => {
    if (!room || myPlayerIndex < 0) return null;
    return room.players[myPlayerIndex];
  }, [room, myPlayerIndex]);

  // Check if card requires target
  const cardRequiresTarget = (card: number): boolean => {
    return [CardType.GUARD, CardType.PRIEST, CardType.BARON, CardType.PRINCE, CardType.KING].includes(card as typeof CardType.GUARD);
  };

  // Check if card requires guess (Guard only)
  const cardRequiresGuess = (card: number): boolean => {
    return card === CardType.GUARD;
  };

  // Get valid targets
  const getValidTargets = useCallback(() => {
    if (!room || selectedCard === null || myPlayerIndex < 0) return [];
    
    return room.players
      .map((p, idx) => ({ player: p, index: idx }))
      .filter(({ player, index }) => {
        // Can't target self (except Prince)
        if (selectedCard !== CardType.PRINCE && index === myPlayerIndex) return false;
        // Can't target eliminated players
        if (!player.is_alive) return false;
        // Can't target immune players
        if (player.is_immune) return false;
        return true;
      });
  }, [room, selectedCard, myPlayerIndex]);

  // Handle join room
  const handleJoinRoom = async () => {
    setActionError(null);
    try {
      await joinRoom(roomId, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to join room');
    }
  };

  // Handle start round (dealer only)
  const handleStartRound = async () => {
    if (!room || !currentAccount) return;
    setActionError(null);

    try {
      // Generate deck and deal cards
      const playerAddresses = room.players.map(p => p.addr);
      const { deckCommitment, playerCommitments, publicCards, secrets } = 
        ZKCryptoUtils.generateDealerSecrets(playerAddresses);

      // Store dealer secrets locally
      setDealerSecrets(secrets);

      // For demo: also set player secrets for current player
      const myCards = secrets.playerCards.get(currentAccount.address);
      const mySalts = secrets.salts.get(currentAccount.address);
      if (myCards && mySalts) {
        setPlayerSecrets({
          cards: myCards,
          salts: mySalts,
        });
      }

      await startRound(roomId, deckCommitment, playerCommitments, publicCards, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to start round');
    }
  };

  // Handle play turn
  const handlePlayTurn = async () => {
    if (selectedCard === null || !playerSecrets) return;
    setActionError(null);

    try {
      // Generate new commitment for remaining card
      const remainingCards = playerSecrets.cards.filter((c: number) => c !== selectedCard);
      const remainingSalts = playerSecrets.salts.slice(1); // Use remaining salts
      
      const newCommitment = remainingCards.length > 0
        ? ZKCryptoUtils.generateCommitment(remainingCards[0] ?? 0, remainingSalts[0] ?? ZKCryptoUtils.generateSalt())
        : [];

      // Update local secrets
      setPlayerSecrets({
        cards: remainingCards,
        salts: remainingSalts,
      });

      await playTurn(roomId, selectedCard, newCommitment, selectedTarget, selectedGuess, room);
      
      setSelectedCard(null);
      setSelectedTarget(null);
      setSelectedGuess(null);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to play turn');
    }
  };

  // Handle respond to Guard
  const handleRespondGuard = async (isCorrect: boolean) => {
    if (!playerSecrets || !pendingAction) return;
    setActionError(null);

    try {
      // Generate ZK proof (placeholder - in real implementation, use snarkjs)
      const proof = ZKCryptoUtils.generateGuardProof(
        playerSecrets.cards[0] ?? 0,
        playerSecrets.salts[0] ?? 0,
        pendingAction.guess ?? 0,
        isCorrect
      );

      await respondGuard(roomId, proof, isCorrect, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to respond to Guard');
    }
  };

  // Handle respond to Baron
  const handleRespondBaron = async () => {
    if (!playerSecrets || !pendingAction || !room) return;
    setActionError(null);

    try {
      const myCard = playerSecrets.cards[0] ?? 0;
      
      // In real implementation, we'd need the initiator's card value
      // For demo, we'll use a placeholder comparison
      // The actual comparison would be done via ZK proof
      
      // Generate ZK proof for comparison
      const proof = ZKCryptoUtils.generateBaronProof(
        myCard,
        playerSecrets.salts[0] ?? 0,
        5, // Placeholder initiator card - in real impl, this comes from secure channel
        BaronResult.TIE // Placeholder result
      );

      // Determine result (placeholder logic)
      const result = BaronResult.TIE;

      await respondBaron(roomId, proof, result, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to respond to Baron');
    }
  };

  // Handle respond to Prince
  const handleRespondPrince = async () => {
    if (!playerSecrets || !dealerSecrets) return;
    setActionError(null);

    try {
      const discardedCard = playerSecrets.cards[0] ?? 0;
      
      // Draw new card from deck (dealer provides)
      const newCard = dealerSecrets.deck.pop() ?? 0;
      const newSalt = ZKCryptoUtils.generateSalt();
      const newCommitment = ZKCryptoUtils.generateCommitment(newCard, newSalt);

      // Update local secrets
      setPlayerSecrets({
        cards: [newCard],
        salts: [newSalt],
      });

      await respondPrince(roomId, discardedCard, newCommitment, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to respond to Prince');
    }
  };

  // Handle respond to King
  const handleRespondKing = async () => {
    if (!playerSecrets || !pendingAction || !room) return;
    setActionError(null);

    try {
      // In King swap, both players exchange cards
      // For demo, we generate new commitments
      // Generate new commitments for swapped cards
      const newSalt = ZKCryptoUtils.generateSalt();
      const initiatorNewCommitment = ZKCryptoUtils.generateCommitment(playerSecrets.cards[0] ?? 0, newSalt);
      
      // Target's new commitment (would be the initiator's card)
      const targetNewCommitment = ZKCryptoUtils.generateCommitment(5, ZKCryptoUtils.generateSalt()); // Placeholder

      await respondKing(roomId, initiatorNewCommitment, targetNewCommitment, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to respond to King');
    }
  };

  // Handle resolve Chancellor
  const handleResolveChancellor = async (keepCardIndex: number) => {
    if (!playerSecrets) return;
    setActionError(null);

    try {
      // For Chancellor, player has 3 cards, keeps 1, returns 2
      const keepCard = playerSecrets.cards[keepCardIndex] ?? 0;
      const newSalt = ZKCryptoUtils.generateSalt();
      const newCommitment = ZKCryptoUtils.generateCommitment(keepCard, newSalt);

      // Update local secrets
      setPlayerSecrets({
        cards: [keepCard],
        salts: [newSalt],
      });

      // Cards returned to deck
      const cardsReturned = playerSecrets.cards.length - 1;

      await resolveChancellor(roomId, newCommitment, cardsReturned, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to resolve Chancellor');
    }
  };

  // Handle timeout
  const handleTimeoutAction = async () => {
    setActionError(null);
    try {
      await handleTimeout(roomId, room);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to handle timeout');
    }
  };

  // Loading states
  if (!isWalletChecked || (isLoading && !room)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto" />
          <p className="mt-4 text-slate-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-400">Wallet Not Connected</h1>
          <p className="text-slate-400 mt-2">Please connect your wallet to play.</p>
          <Button onClick={() => router.push('/rooms_v2')} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-slate-400 mt-2">{error?.message || 'Room not found'}</p>
          <Button onClick={() => router.push('/rooms_v2')} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  const isInRoom = myPlayerIndex >= 0;
  const isCreator = room.creator === currentAccount.address;
  const canJoin = room.status === GameStatus.WAITING && !isInRoom && room.players.length < room.max_players;
  // Allow creator or any player to start round (creator becomes dealer)
  const canStartRound = (isCreator || isInRoom) && 
    (room.status === GameStatus.WAITING || room.status === GameStatus.ROUND_END) && 
    room.players.length >= 2;
  const currentPlayerIndex = Number(room.current_turn) % room.players.length;
  const currentPlayer = room.players[currentPlayerIndex];
  
  // Check if game is finished (someone won)
  const winner = room.status === GameStatus.FINISHED 
    ? room.players.find(p => p.tokens >= room.tokens_to_win)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">{room.name}</h1>
            <p className="text-slate-400">
              Round {room.round_number} • Status: {getStatusText(room.status)}
              {isCreator && <span className="ml-2 text-amber-500">(Creator)</span>}
              {isDealer && room.status === GameStatus.PLAYING && <span className="ml-2 text-green-500">(Dealer)</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Deck Size</p>
            <p className="text-xl font-bold text-amber-400">{Number(room.deck_size)}</p>
          </div>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400">{actionError}</p>
          </div>
        )}

        {/* Join Room Button */}
        {canJoin && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 text-center">
            <p className="mb-4 text-slate-300">Join this room to play!</p>
            <Button onClick={handleJoinRoom} disabled={isJoining} size="lg">
              {isJoining ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        )}

        {/* Game Finished UI */}
        {room.status === GameStatus.FINISHED && winner && (
          <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold text-amber-400 mb-2">🎉 Game Over! 🎉</h2>
            <p className="text-xl text-amber-300 mb-4">
              {winner.addr === currentAccount.address ? 'You Won!' : `Player ${room.players.findIndex(p => p.addr === winner.addr) + 1} Wins!`}
            </p>
            <p className="text-slate-400 mb-4">
              {winner.addr.slice(0, 8)}...{winner.addr.slice(-6)} earned {winner.tokens} tokens
            </p>
            <Button onClick={() => router.push('/rooms_v2')} size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
              Back to Lobby
            </Button>
          </div>
        )}

        {/* Start Round Button */}
        {canStartRound && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 text-center">
            <p className="mb-4 text-slate-300">
              {room.status === GameStatus.WAITING
                ? `Waiting for players (${room.players.length}/${room.max_players})`
                : 'Round ended. Start a new round?'}
            </p>
            <Button 
              onClick={handleStartRound} 
              disabled={isStartingRound} 
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              {isStartingRound ? 'Starting...' : room.status === GameStatus.WAITING ? 'Start Game' : 'Start Next Round'}
            </Button>
            {!isCreator && (
              <p className="text-xs text-slate-500 mt-2">
                (You will become the dealer for this round)
              </p>
            )}
          </div>
        )}

        {/* Pending Action UI */}
        {hasPendingAction && pendingAction && (
          <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-amber-400 mb-4">
              Pending Action: {getActionTypeName(pendingAction.actionType)}
            </h3>
            <p className="text-slate-300 mb-4">
              You need to respond to this action.
              {pendingAction.guess !== null && pendingAction.guess !== undefined && (
                <span className="ml-2">Guessed card: {CardNames[pendingAction.guess]}</span>
              )}
            </p>
            <div className="flex gap-4">
              {pendingAction.actionType === ActionType.GUARD_PENDING && (
                <>
                  <Button
                    onClick={() => handleRespondGuard(true)}
                    disabled={isRespondingGuard}
                    variant="destructive"
                  >
                    {isRespondingGuard ? 'Responding...' : 'Correct (Eliminated)'}
                  </Button>
                  <Button
                    onClick={() => handleRespondGuard(false)}
                    disabled={isRespondingGuard}
                  >
                    {isRespondingGuard ? 'Responding...' : 'Wrong (Safe)'}
                  </Button>
                </>
              )}
              {pendingAction.actionType === ActionType.BARON_PENDING && (
                <Button onClick={handleRespondBaron} disabled={isRespondingBaron}>
                  {isRespondingBaron ? 'Comparing...' : 'Compare Cards'}
                </Button>
              )}
              {pendingAction.actionType === ActionType.PRINCE_PENDING && (
                <Button onClick={handleRespondPrince} disabled={isRespondingPrince}>
                  {isRespondingPrince ? 'Discarding...' : 'Discard & Draw'}
                </Button>
              )}
              {pendingAction.actionType === ActionType.KING_PENDING && (
                <Button onClick={handleRespondKing} disabled={isRespondingKing}>
                  {isRespondingKing ? 'Swapping...' : 'Swap Cards'}
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Deadline: {new Date(pendingAction.deadline).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Chancellor Resolution UI */}
        {room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx) && playerSecrets && (
          <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-purple-400 mb-4">Chancellor: Choose a card to keep</h3>
            <div className="flex gap-4 flex-wrap mb-4">
              {playerSecrets.cards.map((card: number, idx: number) => (
                <button
                  type="button"
                  key={`chancellor-card-${card}-pos-${idx}`}
                  onClick={() => handleResolveChancellor(idx)}
                  disabled={isResolvingChancellor}
                  className="p-4 rounded-lg border-2 border-purple-600 hover:border-purple-400 bg-slate-800 transition-all"
                >
                  <p className="font-bold text-purple-300">{CardNames[card]}</p>
                  <p className="text-sm text-slate-400">Value: {card}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {room.players.map((player, idx) => {
            const isCurrentTurn = idx === currentPlayerIndex && room.status === GameStatus.PLAYING;
            const isMe = player.addr === currentAccount.address;

            return (
              <div
                key={player.addr}
                className={cn(
                  "rounded-lg p-4 transition-all",
                  isCurrentTurn
                    ? 'bg-amber-500/20 border-2 border-amber-500'
                    : 'bg-slate-800',
                  !player.is_alive && 'opacity-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-amber-300">
                    {isMe ? 'You' : `Player ${idx + 1}`}
                    {player.is_immune && ' 🛡️'}
                    {idx === 0 && ' 👑'}
                  </span>
                  <span className="text-amber-500">{'❤️'.repeat(player.tokens)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{player.addr.slice(0, 8)}...</p>
                <p className="text-sm text-slate-400">Cards: {player.hand_count}</p>
                {!player.is_alive && (
                  <p className="text-red-400 text-sm mt-1">Eliminated</p>
                )}
                {isCurrentTurn && (
                  <p className="text-amber-400 text-sm mt-1">Current Turn</p>
                )}
                {/* Discarded cards */}
                {player.discarded.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500">Discarded:</p>
                    <div className="flex gap-1 flex-wrap">
                      {player.discarded.map((card: number, cardIdx: number) => (
                        <span key={`discard-${player.addr}-${card}-${cardIdx}`} className="text-xs bg-slate-700 px-1 rounded">
                          {CardNames[card]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* My Hand (Local Secrets) */}
        {myPlayer && room.status === GameStatus.PLAYING && playerSecrets && !room.chancellor_pending && !hasPendingAction && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-amber-400">Your Hand (Secret)</h2>
            <div className="flex gap-4 flex-wrap mb-4">
              {playerSecrets.cards.map((card: number, idx: number) => (
                <button
                  type="button"
                  key={`hand-card-${card}-pos-${idx}`}
                  onClick={() => isMyTurn && setSelectedCard(selectedCard === card ? null : card)}
                  disabled={!isMyTurn}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    selectedCard === card
                      ? 'border-amber-500 bg-amber-500/20'
                      : isMyTurn
                        ? 'border-slate-600 hover:border-slate-400 cursor-pointer'
                        : 'border-slate-700 opacity-50'
                  )}
                >
                  <p className="font-bold text-amber-300">{CardNames[card]}</p>
                  <p className="text-sm text-slate-400">Value: {card}</p>
                  <p className="text-xs text-slate-500 mt-1">{CARD_DATA[card]?.description}</p>
                </button>
              ))}
            </div>

            {/* Target Selection */}
            {isMyTurn && selectedCard !== null && cardRequiresTarget(selectedCard) && (
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">Select Target:</p>
                <div className="flex gap-2 flex-wrap">
                  {getValidTargets().map(({ player, index }) => (
                    <button
                      type="button"
                      key={`target-${player.addr}`}
                      onClick={() => setSelectedTarget(selectedTarget === index ? null : index)}
                      className={cn(
                        "px-3 py-1 rounded border transition-all",
                        selectedTarget === index
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-slate-600 hover:border-slate-400'
                      )}
                    >
                      {player.addr === currentAccount.address ? 'You' : `Player ${index + 1}`}
                    </button>
                  ))}
                  {getValidTargets().length === 0 && (
                    <p className="text-slate-500">No valid targets (all immune)</p>
                  )}
                </div>
              </div>
            )}

            {/* Guess Selection (Guard) */}
            {isMyTurn && selectedCard === CardType.GUARD && selectedTarget !== null && (
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">Guess a card (not Guard):</p>
                <div className="flex gap-2 flex-wrap">
                  {[0, 2, 3, 4, 5, 6, 7, 8, 9].map(card => (
                    <button
                      type="button"
                      key={`guess-${card}`}
                      onClick={() => setSelectedGuess(selectedGuess === card ? null : card)}
                      className={cn(
                        "px-3 py-1 rounded border transition-all",
                        selectedGuess === card
                          ? 'border-amber-500 bg-amber-500/20'
                          : 'border-slate-600 hover:border-slate-400'
                      )}
                    >
                      {CardNames[card]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Play Button */}
            {isMyTurn && (
              <Button
                onClick={handlePlayTurn}
                disabled={
                  selectedCard === null ||
                  isPlayingTurn ||
                  (cardRequiresTarget(selectedCard) && selectedTarget === null && getValidTargets().length > 0) ||
                  (cardRequiresGuess(selectedCard) && selectedGuess === null)
                }
              >
                {isPlayingTurn ? 'Playing...' : 'Play Card'}
              </Button>
            )}

            {!isMyTurn && myPlayer.is_alive && (
              <p className="text-slate-400">
                Waiting for {currentPlayer?.addr.slice(0, 8)}... to play
              </p>
            )}
          </div>
        )}

        {/* No secrets warning */}
        {myPlayer && room.status === GameStatus.PLAYING && !playerSecrets && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2 text-red-400">No Card Data</h2>
            <p className="text-slate-300">
              Your card data is not available. This can happen if you joined after the round started
              or if the page was refreshed. In a production environment, this would be handled by
              secure card distribution from the dealer.
            </p>
          </div>
        )}

        {/* Game Info */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Deck Size: {Number(room.deck_size)}</span>
            <span className="text-slate-400">Tokens to Win: {room.tokens_to_win}</span>
          </div>
          {room.public_cards.length > 0 && (
            <div className="mt-2">
              <span className="text-slate-400 text-sm">Public Cards: </span>
              {room.public_cards.map((card: number, idx: number) => (
                <span key={`public-card-${card}-${idx}`} className="text-amber-400 text-sm mr-2">{CardNames[card]}</span>
              ))}
            </div>
          )}
        </div>

        {/* Timeout Button */}
        {room.pending_action && !hasPendingAction && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-slate-400 text-sm mb-2">
              Waiting for player to respond. You can trigger timeout after deadline.
            </p>
            <Button
              onClick={handleTimeoutAction}
              disabled={isHandlingTimeout}
              variant="outline"
              size="sm"
            >
              {isHandlingTimeout ? 'Processing...' : 'Trigger Timeout'}
            </Button>
          </div>
        )}

        {/* Back to Lobby */}
        <div className="text-center">
          <Button variant="outline" onClick={() => router.push('/rooms_v2')}>
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusText(status: number): string {
  const statusMap: Record<number, string> = {
    [GameStatus.WAITING]: 'Waiting for Players',
    [GameStatus.PLAYING]: 'Playing',
    [GameStatus.ROUND_END]: 'Round End',
    [GameStatus.FINISHED]: 'Finished',
    [GameStatus.PENDING_PROOF]: 'Pending Proof',
  };
  return statusMap[status] || 'Unknown';
}

function getActionTypeName(actionType: number): string {
  const actionMap: Record<number, string> = {
    [ActionType.GUARD_PENDING]: 'Guard',
    [ActionType.BARON_PENDING]: 'Baron',
    [ActionType.PRIEST_PENDING]: 'Priest',
    [ActionType.PRINCE_PENDING]: 'Prince',
    [ActionType.KING_PENDING]: 'King',
    [ActionType.CHANCELLOR_PENDING]: 'Chancellor',
  };
  return actionMap[actionType] || 'Unknown';
}
