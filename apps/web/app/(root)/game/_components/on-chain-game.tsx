'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { 
  useGetRoom, 
  useStartRound, 
  usePlayTurn, 
  useResolveChancellor,
} from '@/hooks/use-game-contract';

// Card names mapping
const CARD_NAMES: Record<number, string> = {
  0: 'Spy',
  1: 'Guard',
  2: 'Priest',
  3: 'Baron',
  4: 'Handmaid',
  5: 'Prince',
  6: 'Chancellor',
  7: 'King',
  8: 'Countess',
  9: 'Princess',
};

// Game status mapping
const STATUS_TEXT: Record<number, string> = {
  0: 'Waiting for Players',
  1: 'Playing',
  2: 'Round End',
  3: 'Finished',
};

interface OnChainGameProps {
  roomId: string;
}

export function OnChainGame({ roomId }: OnChainGameProps) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { room, fetchRoom, isLoading, error } = useGetRoom(roomId);
  const { startRound, isPending: isStartingRound } = useStartRound();
  const { playTurn, isPending: isPlayingTurn } = usePlayTurn();
  const { resolveChancellor, isPending: isResolvingChancellor } = useResolveChancellor();

  // UI state
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [chancellorKeepCard, setChancellorKeepCard] = useState<number | null>(null);
  const [chancellorReturnOrder, setChancellorReturnOrder] = useState<number[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch room data on mount and periodically
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Get current player info
  const myPlayerIndex = room?.players.findIndex(p => p.addr === currentAccount?.address) ?? -1;
  const myPlayer = myPlayerIndex >= 0 ? room?.players[myPlayerIndex] : null;
  const isMyTurn = room ? (Number(room.current_turn) % room.players.length) === myPlayerIndex : false;
  const currentPlayerIndex = room ? Number(room.current_turn) % room.players.length : 0;
  const currentPlayer = room?.players[currentPlayerIndex];

  // Check if user can start round
  const canStartRound = room && 
    (room.status === 0 || room.status === 2) && 
    room.players.length >= 2 &&
    (room.creator === currentAccount?.address || myPlayerIndex >= 0);

  // Check if card requires target
  const cardRequiresTarget = (card: number): boolean => {
    return [1, 2, 3, 5, 7].includes(card); // Guard, Priest, Baron, Prince, King
  };

  // Check if card requires guess (Guard only)
  const cardRequiresGuess = (card: number): boolean => {
    return card === 1; // Guard
  };

  // Handle start round
  const handleStartRound = async () => {
    setActionError(null);
    try {
      await startRound(roomId);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to start round');
    }
  };

  // Handle play turn
  const handlePlayTurn = async () => {
    if (selectedCard === null) return;
    
    setActionError(null);
    try {
      await playTurn(roomId, selectedCard, selectedTarget, selectedGuess);
      setSelectedCard(null);
      setSelectedTarget(null);
      setSelectedGuess(null);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to play turn');
    }
  };

  // Handle chancellor resolution
  const handleResolveChancellor = async () => {
    if (chancellorKeepCard === null || chancellorReturnOrder.length !== 2) return;
    
    setActionError(null);
    try {
      await resolveChancellor(roomId, chancellorKeepCard, chancellorReturnOrder);
      setChancellorKeepCard(null);
      setChancellorReturnOrder([]);
      fetchRoom();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to resolve chancellor');
    }
  };

  // Get valid targets for current card
  const getValidTargets = useCallback(() => {
    if (!room || selectedCard === null || myPlayerIndex < 0) return [];
    
    return room.players
      .map((p, idx) => ({ player: p, index: idx }))
      .filter(({ player, index }) => {
        // Can't target self (except Prince)
        if (selectedCard !== 5 && index === myPlayerIndex) return false;
        // Can't target eliminated players
        if (!player.is_alive) return false;
        // Can't target immune players
        if (player.is_immune) return false;
        return true;
      });
  }, [room, selectedCard, myPlayerIndex]);

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Wallet Not Connected</h1>
          <p className="text-muted-foreground mt-2">Please connect your wallet to play.</p>
          <Button onClick={() => router.push('/')} className="mt-4">
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

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="text-muted-foreground mt-2">{error?.message || 'Room not found'}</p>
          <Button onClick={() => router.push('/')} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <p className="text-slate-400">
              Round {room.round_number} • {STATUS_TEXT[room.status]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Pot</p>
            <p className="text-xl font-bold">
              {(Number(room.pot.value) / 1_000_000_000).toFixed(3)} SUI
            </p>
          </div>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400">{actionError}</p>
          </div>
        )}

        {/* Start Round Button */}
        {canStartRound && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 text-center">
            <p className="mb-4">
              {room.status === 0 
                ? `Waiting for players (${room.players.length}/${room.max_players})`
                : 'Round ended. Start a new round?'
              }
            </p>
            <Button 
              onClick={handleStartRound} 
              disabled={isStartingRound}
              size="lg"
            >
              {isStartingRound ? 'Starting...' : 'Start Round'}
            </Button>
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {room.players.map((player, idx) => {
            const isCurrentTurn = idx === currentPlayerIndex && room.status === 1;
            const isMe = player.addr === currentAccount.address;
            
            return (
              <div 
                key={player.addr}
                className={`rounded-lg p-4 ${
                  isCurrentTurn 
                    ? 'bg-yellow-500/20 border-2 border-yellow-500' 
                    : 'bg-slate-800'
                } ${!player.is_alive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {isMe ? 'You' : `Player ${idx + 1}`}
                    {player.is_immune && ' 🛡️'}
                  </span>
                  <span className="text-yellow-500">{'❤️'.repeat(player.tokens)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{player.addr.slice(0, 8)}...</p>
                {!player.is_alive && (
                  <p className="text-red-400 text-sm mt-1">Eliminated</p>
                )}
                {isCurrentTurn && (
                  <p className="text-yellow-400 text-sm mt-1">Current Turn</p>
                )}
              </div>
            );
          })}
        </div>

        {/* My Hand */}
        {myPlayer && room.status === 1 && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Your Hand</h2>
            
            {/* Chancellor Pending */}
            {room.chancellor_pending && myPlayerIndex === Number(room.chancellor_player_idx) ? (
              <div>
                <p className="mb-4">Choose a card to keep (return the other 2 to deck):</p>
                <div className="flex gap-4 flex-wrap mb-4">
                  {room.chancellor_cards.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (chancellorKeepCard === card) {
                          setChancellorKeepCard(null);
                        } else {
                          setChancellorKeepCard(card);
                          setChancellorReturnOrder(
                            room.chancellor_cards.filter(c => c !== card)
                          );
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        chancellorKeepCard === card
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      <p className="font-bold">{CARD_NAMES[card]}</p>
                      <p className="text-sm text-slate-400">Value: {card}</p>
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={handleResolveChancellor}
                  disabled={chancellorKeepCard === null || isResolvingChancellor}
                >
                  {isResolvingChancellor ? 'Resolving...' : 'Confirm Selection'}
                </Button>
              </div>
            ) : (
              <>
                {/* Normal Hand Display */}
                <div className="flex gap-4 flex-wrap mb-4">
                  {myPlayer.hand.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => isMyTurn && setSelectedCard(selectedCard === card ? null : card)}
                      disabled={!isMyTurn}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCard === card
                          ? 'border-blue-500 bg-blue-500/20'
                          : isMyTurn 
                            ? 'border-slate-600 hover:border-slate-400 cursor-pointer' 
                            : 'border-slate-700 opacity-50'
                      }`}
                    >
                      <p className="font-bold">{CARD_NAMES[card]}</p>
                      <p className="text-sm text-slate-400">Value: {card}</p>
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
                          key={index}
                          onClick={() => setSelectedTarget(selectedTarget === index ? null : index)}
                          className={`px-3 py-1 rounded border ${
                            selectedTarget === index
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-slate-600 hover:border-slate-400'
                          }`}
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
                {isMyTurn && selectedCard === 1 && selectedTarget !== null && (
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Guess a card (not Guard):</p>
                    <div className="flex gap-2 flex-wrap">
                      {[0, 2, 3, 4, 5, 6, 7, 8, 9].map(card => (
                        <button
                          key={card}
                          onClick={() => setSelectedGuess(selectedGuess === card ? null : card)}
                          className={`px-3 py-1 rounded border ${
                            selectedGuess === card
                              ? 'border-blue-500 bg-blue-500/20'
                              : 'border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {CARD_NAMES[card]}
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
                  <p className="text-slate-400">Waiting for {currentPlayer?.addr.slice(0, 8)}... to play</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Game Info */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Deck Size: {room.deck.length}</span>
            <span className="text-slate-400">Tokens to Win: {room.tokens_to_win}</span>
          </div>
        </div>

        {/* Back to Lobby */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
