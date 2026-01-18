"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetRoomV4,
  useSubmitEncryptedDeck,
  usePlayTurnV4,
  useRespondGuardV4,
  useRespondBaronV4,
  useRespondPrinceV4,
  useResolveChancellorV4,
  usePlayerIndexV4,
  useIsMyTurnV4,
  useMyHandIndicesV4,
  usePendingActionV4,
  useNeedToRespondV4,
  GameStatus,
  PendingActionType,
  CardNames,
  CardType,
  type DecryptedCard,
} from "@/hooks/use-game-contract-v4";
import { useDecryptCards } from "@/hooks/use-seal-client";
import { Lock, Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";

// Game status mapping
const STATUS_TEXT: Record<number, string> = {
  0: "Waiting for Players",
  1: "Playing",
  2: "Round End",
  3: "Finished",
};

interface SealedGameV4Props {
  roomId: string;
}

export function SealedGameV4({ roomId }: SealedGameV4Props) {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const { room, fetchRoom, isLoading, error } = useGetRoomV4(roomId);
  const { submitDeck, isPending: isSubmittingDeck } = useSubmitEncryptedDeck();
  const { playTurn, isPending: isPlayingTurn } = usePlayTurnV4();
  const { respondGuard, isPending: isRespondingGuard } = useRespondGuardV4();
  const { respondBaron, isPending: isRespondingBaron } = useRespondBaronV4();
  const { respondPrince, isPending: isRespondingPrince } = useRespondPrinceV4();
  const { resolveChancellor, isPending: isResolvingChancellor } =
    useResolveChancellorV4();
  const { decryptCards, isDecrypting: isSealDecrypting, error: sealError } = useDecryptCards();

  // Game state
  const myPlayerIndex = usePlayerIndexV4(room);
  const isMyTurn = useIsMyTurnV4(room);
  const myHandIndices = useMyHandIndicesV4(room);
  const pendingAction = usePendingActionV4(room);
  const needToRespond = useNeedToRespondV4(room);

  // UI state
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [decryptedCards, setDecryptedCards] = useState<DecryptedCard[]>([]);
  const [showCardValues, setShowCardValues] = useState(true);
  const [chancellorKeepIndex, setChancellorKeepIndex] = useState<number | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch room data periodically
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Decrypt hand when it changes
  useEffect(() => {
    if (!room || myHandIndices.length === 0) return;

    const doDecrypt = async () => {
      try {
        // Convert encrypted cards to the format expected by decryptCards
        const encryptedCards: Array<{ ciphertext: Uint8Array }> =
          room.encrypted_cards.map((card, idx) => {
            // Handle the Decryptable enum structure
            if ("Encrypted" in card && card.Encrypted) {
              if (idx === 16) {
                console.log("=== On-chain Card 16 Debug ===");
                console.log("ciphertext:", card.Encrypted.ciphertext);
                console.log("hash:", card.Encrypted.hash);
                console.log("nonce:", card.Encrypted.nonce);
              }
              return {
                ciphertext: new Uint8Array(card.Encrypted.ciphertext),
              };
            } else if ("Decrypted" in card && card.Decrypted) {
              return {
                ciphertext: new Uint8Array(card.Decrypted.data),
              };
            }
            return { ciphertext: new Uint8Array() };
          });

        // Convert string indices to numbers
        const numericIndices = myHandIndices.map((idx) => Number(idx));
        const decrypted = await decryptCards(roomId, numericIndices, encryptedCards);
        setDecryptedCards(decrypted);
      } catch (err) {
        console.error("Failed to decrypt hand:", err);
      }
    };

    doDecrypt();
  }, [room, myHandIndices, roomId, decryptCards]);

  // Get decrypted value for a card index
  const getCardValue = useCallback(
    (cardIndex: number): number | null => {
      const decrypted = decryptedCards.find((c) => c.cardIndex === cardIndex);
      return decrypted?.value ?? null;
    },
    [decryptedCards]
  );

  // Get current player info
  const myPlayer =
    myPlayerIndex >= 0 && room ? room.players[myPlayerIndex] : null;
  const currentPlayerIndex = room
    ? Number(room.current_turn) % room.players.length
    : 0;
  const currentPlayer = room?.players[currentPlayerIndex];

  // Check if user can submit deck
  const canSubmitDeck =
    room &&
    (room.status === GameStatus.WAITING ||
      room.status === GameStatus.ROUND_END) &&
    room.players.length >= 2 &&
    room.encrypted_cards.length === 0 &&
    (room.creator === currentAccount?.address || myPlayerIndex >= 0);

  // Check if card requires target
  const cardRequiresTarget = (card: number): boolean => {
    const targetCards: number[] = [
      CardType.GUARD,
      CardType.PRIEST,
      CardType.BARON,
      CardType.PRINCE,
      CardType.KING,
    ];
    return targetCards.includes(card);
  };

  // Check if card requires guess (Guard only)
  const cardRequiresGuess = (card: number): boolean => {
    return card === CardType.GUARD;
  };

  // Handle submit deck
  const handleSubmitDeck = async () => {
    setActionError(null);
    try {
      await submitDeck(roomId);
      fetchRoom();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to submit deck"
      );
    }
  };

  // Handle play turn
  const handlePlayTurn = async () => {
    if (selectedCardIndex === null) return;

    const cardValue = getCardValue(selectedCardIndex);
    if (cardValue === null || cardValue < 0) {
      setActionError("Card not decrypted yet. Please wait for Seal decryption or try refreshing.");
      return;
    }

    setActionError(null);
    try {
      await playTurn(
        roomId,
        selectedCardIndex,
        cardValue,
        selectedTarget,
        selectedGuess
      );
      setSelectedCardIndex(null);
      setSelectedTarget(null);
      setSelectedGuess(null);
      fetchRoom();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to play turn"
      );
    }
  };

  // Handle pending action responses
  const handleRespondGuard = async () => {
    if (!pendingAction) return;

    const cardIndex = Number(pendingAction.card_index);
    const cardValue = getCardValue(cardIndex);
    if (cardValue === null) {
      setActionError("Card not decrypted yet");
      return;
    }

    setActionError(null);
    try {
      await respondGuard(roomId, cardIndex, cardValue);
      fetchRoom();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to respond to Guard"
      );
    }
  };

  const handleRespondBaron = async () => {
    if (!pendingAction) return;

    const cardIndex = Number(pendingAction.card_index);
    const cardValue = getCardValue(cardIndex);
    if (cardValue === null) {
      setActionError("Card not decrypted yet");
      return;
    }

    setActionError(null);
    try {
      await respondBaron(roomId, cardIndex, cardValue);
      fetchRoom();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to respond to Baron"
      );
    }
  };

  const handleRespondPrince = async () => {
    if (!pendingAction) return;

    const cardIndex = Number(pendingAction.card_index);
    const cardValue = getCardValue(cardIndex);
    if (cardValue === null) {
      setActionError("Card not decrypted yet");
      return;
    }

    setActionError(null);
    try {
      await respondPrince(roomId, cardIndex, cardValue);
      fetchRoom();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to respond to Prince"
      );
    }
  };

  // Handle chancellor resolution
  const handleResolveChancellor = async () => {
    if (chancellorKeepIndex === null || !room) return;

    const returnIndices = room.chancellor_card_indices.filter(
      (idx) => Number(idx) !== chancellorKeepIndex
    );

    setActionError(null);
    try {
      await resolveChancellor(
        roomId,
        chancellorKeepIndex,
        returnIndices.map(BigInt)
      );
      setChancellorKeepIndex(null);
      fetchRoom();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to resolve chancellor"
      );
    }
  };

  // Get valid targets
  const getValidTargets = useCallback(() => {
    if (!room || selectedCardIndex === null || myPlayerIndex < 0) return [];

    const cardValue = getCardValue(selectedCardIndex);
    if (cardValue === null) return [];

    return room.players
      .map((p, idx) => ({ player: p, index: idx }))
      .filter(({ player, index }) => {
        // Prince can target self
        if (cardValue !== CardType.PRINCE && index === myPlayerIndex)
          return false;
        if (!player.is_alive) return false;
        if (player.is_immune && index !== myPlayerIndex) return false;
        return true;
      });
  }, [room, selectedCardIndex, myPlayerIndex, getCardValue]);

  // Check if all others are immune
  const allOthersImmune = useCallback(() => {
    if (!room || myPlayerIndex < 0) return true;
    return room.players.every(
      (p, idx) => idx === myPlayerIndex || !p.is_alive || p.is_immune
    );
  }, [room, myPlayerIndex]);

  if (!currentAccount) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Wallet Not Connected</h1>
          <p className="text-muted-foreground mt-2">
            Please connect your wallet to play.
          </p>
          <Button onClick={() => router.push("/")} className="mt-4">
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
          <p className="text-muted-foreground mt-2">
            {error?.message || "Room not found"}
          </p>
          <Button onClick={() => router.push("/rooms_v4")} className="mt-4">
            Go to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {room.name}
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Seal V4
              </Badge>
            </h1>
            <p className="text-slate-400">
              Round {room.round_number} • {STATUS_TEXT[room.status]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Deck</p>
            <p className="text-xl font-bold">{room.deck_indices.length} cards</p>
          </div>
        </div>

        {/* Action Error */}
        {(actionError || sealError) && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <p className="text-red-400">{actionError || sealError}</p>
          </div>
        )}

        {/* Submit Deck Button */}
        {canSubmitDeck && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6 text-center">
            <Lock className="h-8 w-8 mx-auto mb-4 text-yellow-400" />
            <p className="mb-4">
              {room.status === GameStatus.WAITING
                ? `Waiting for players (${room.players.length}/${room.max_players}). Ready to start?`
                : "Round ended. Submit a new encrypted deck to start?"}
            </p>
            <Button
              onClick={handleSubmitDeck}
              disabled={isSubmittingDeck}
              size="lg"
            >
              {isSubmittingDeck
                ? "Encrypting & Submitting..."
                : "Submit Encrypted Deck & Start"}
            </Button>
          </div>
        )}

        {/* Pending Action Alert */}
        {needToRespond && pendingAction && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Action Required!
            </h3>
            {pendingAction.action_type === PendingActionType.GUARD_RESPONSE && (
              <div>
                <p className="mb-3">
                  You've been targeted by Guard! Reveal your card to resolve.
                </p>
                <Button
                  onClick={handleRespondGuard}
                  disabled={isRespondingGuard}
                  variant="secondary"
                >
                  {isRespondingGuard ? "Revealing..." : "Reveal Card"}
                </Button>
              </div>
            )}
            {pendingAction.action_type === PendingActionType.BARON_RESPONSE && (
              <div>
                <p className="mb-3">
                  Baron comparison! Reveal your card to compare.
                </p>
                <Button
                  onClick={handleRespondBaron}
                  disabled={isRespondingBaron}
                  variant="secondary"
                >
                  {isRespondingBaron ? "Revealing..." : "Reveal Card"}
                </Button>
              </div>
            )}
            {pendingAction.action_type ===
              PendingActionType.PRINCE_RESPONSE && (
              <div>
                <p className="mb-3">
                  Prince forces you to discard! Reveal your card.
                </p>
                <Button
                  onClick={handleRespondPrince}
                  disabled={isRespondingPrince}
                  variant="secondary"
                >
                  {isRespondingPrince ? "Revealing..." : "Reveal & Discard"}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Players */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {room.players.map((player, idx) => {
            const isCurrentTurn =
              idx === currentPlayerIndex && room.status === GameStatus.PLAYING;
            const isMe = player.addr === currentAccount.address;
            const isPendingResponder =
              pendingAction?.responder === player.addr;

            return (
              <div
                key={player.addr}
                className={`rounded-lg p-4 ${
                  isCurrentTurn
                    ? "bg-yellow-500/20 border-2 border-yellow-500"
                    : isPendingResponder
                      ? "bg-orange-500/20 border-2 border-orange-500"
                      : "bg-slate-800"
                } ${!player.is_alive ? "opacity-50" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {isMe ? "You" : `Player ${idx + 1}`}
                    {player.is_immune && " 🛡️"}
                  </span>
                  <span className="text-yellow-500">
                    {"❤️".repeat(player.tokens)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {player.addr.slice(0, 8)}...
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                  <Lock className="h-3 w-3" />
                  {player.hand.length} card(s)
                </div>
                {!player.is_alive && (
                  <p className="text-red-400 text-sm mt-1">Eliminated</p>
                )}
                {isCurrentTurn && (
                  <p className="text-yellow-400 text-sm mt-1">Current Turn</p>
                )}
                {isPendingResponder && (
                  <p className="text-orange-400 text-sm mt-1">Must Respond</p>
                )}
              </div>
            );
          })}
        </div>

        {/* My Hand */}
        {myPlayer && room.status === GameStatus.PLAYING && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Your Hand
                {isSealDecrypting && (
                  <span className="text-sm text-slate-400">(Decrypting...)</span>
                )}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCardValues(!showCardValues)}
              >
                {showCardValues ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Chancellor Pending */}
            {room.chancellor_pending &&
            myPlayerIndex === Number(room.chancellor_player_idx) ? (
              <div>
                <p className="mb-4">
                  Choose a card to keep (return the others to deck):
                </p>
                <div className="flex gap-4 flex-wrap mb-4">
                  {room.chancellor_card_indices.map((cardIdx) => {
                    const idx = Number(cardIdx);
                    const value = getCardValue(idx);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() =>
                          setChancellorKeepIndex(
                            chancellorKeepIndex === idx ? null : idx
                          )
                        }
                        className={`p-4 rounded-lg border-2 transition-all ${
                          chancellorKeepIndex === idx
                            ? "border-green-500 bg-green-500/20"
                            : "border-slate-600 hover:border-slate-400"
                        }`}
                      >
                        <p className="font-bold">
                          {showCardValues && value !== null
                            ? CardNames[value]
                            : "???"}
                        </p>
                        <p className="text-sm text-slate-400">
                          Index: {idx}
                          {showCardValues && value !== null && ` (${value})`}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={handleResolveChancellor}
                  disabled={chancellorKeepIndex === null || isResolvingChancellor}
                >
                  {isResolvingChancellor ? "Resolving..." : "Confirm Selection"}
                </Button>
              </div>
            ) : (
              <>
                {/* Normal Hand Display */}
                <div className="flex gap-4 flex-wrap mb-4">
                  {myHandIndices.map((cardIdx) => {
                    const idx = Number(cardIdx);
                    const value = getCardValue(idx);
                    const isSelected = selectedCardIndex === idx;

                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() =>
                          isMyTurn &&
                          !needToRespond &&
                          setSelectedCardIndex(isSelected ? null : idx)
                        }
                        disabled={!isMyTurn || needToRespond}
                        className={`p-4 rounded-lg border-2 transition-all min-w-[100px] ${
                          isSelected
                            ? "border-blue-500 bg-blue-500/20"
                            : isMyTurn && !needToRespond
                              ? "border-slate-600 hover:border-slate-400 cursor-pointer"
                              : "border-slate-700 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Lock className="h-3 w-3 text-slate-500" />
                        </div>
                        <p className="font-bold">
                          {showCardValues && value !== null && value >= 0
                            ? CardNames[value]
                            : "???"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {showCardValues && value !== null && value >= 0
                            ? `Value: ${value}`
                            : value === -1
                              ? "Decrypt Failed"
                              : "Encrypted"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Target Selection */}
                {isMyTurn &&
                  !needToRespond &&
                  selectedCardIndex !== null &&
                  (() => {
                    const cardValue = getCardValue(selectedCardIndex);
                    if (cardValue === null) return null;
                    if (!cardRequiresTarget(cardValue)) return null;
                    if (allOthersImmune() && cardValue !== CardType.PRINCE)
                      return null;

                    return (
                      <div className="mb-4">
                        <p className="text-sm text-slate-400 mb-2">
                          Select Target:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {getValidTargets().map(({ player, index }) => (
                            <button
                              type="button"
                              key={index}
                              onClick={() =>
                                setSelectedTarget(
                                  selectedTarget === index ? null : index
                                )
                              }
                              className={`px-3 py-1 rounded border ${
                                selectedTarget === index
                                  ? "border-blue-500 bg-blue-500/20"
                                  : "border-slate-600 hover:border-slate-400"
                              }`}
                            >
                              {player.addr === currentAccount.address
                                ? "You"
                                : `Player ${index + 1}`}
                            </button>
                          ))}
                          {getValidTargets().length === 0 && (
                            <p className="text-slate-500">
                              No valid targets (all immune)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                {/* Guess Selection (Guard) */}
                {isMyTurn &&
                  !needToRespond &&
                  selectedCardIndex !== null &&
                  selectedTarget !== null &&
                  (() => {
                    const cardValue = getCardValue(selectedCardIndex);
                    if (cardValue !== CardType.GUARD) return null;

                    return (
                      <div className="mb-4">
                        <p className="text-sm text-slate-400 mb-2">
                          Guess a card (not Guard):
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 2, 3, 4, 5, 6, 7, 8, 9].map((guess) => (
                            <button
                              type="button"
                              key={guess}
                              onClick={() =>
                                setSelectedGuess(
                                  selectedGuess === guess ? null : guess
                                )
                              }
                              className={`px-3 py-1 rounded border ${
                                selectedGuess === guess
                                  ? "border-blue-500 bg-blue-500/20"
                                  : "border-slate-600 hover:border-slate-400"
                              }`}
                            >
                              {CardNames[guess]}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {/* Play Button */}
                {isMyTurn && !needToRespond && (
                  <Button
                    onClick={handlePlayTurn}
                    disabled={
                      selectedCardIndex === null ||
                      isPlayingTurn ||
                      (() => {
                        const cardValue = getCardValue(selectedCardIndex);
                        if (cardValue === null) return true;
                        if (
                          cardRequiresTarget(cardValue) &&
                          selectedTarget === null &&
                          !allOthersImmune()
                        )
                          return true;
                        if (
                          cardRequiresGuess(cardValue) &&
                          selectedGuess === null &&
                          !allOthersImmune()
                        )
                          return true;
                        return false;
                      })()
                    }
                  >
                    {isPlayingTurn ? "Playing..." : "Play Card"}
                  </Button>
                )}

                {!isMyTurn && myPlayer.is_alive && !needToRespond && (
                  <p className="text-slate-400">
                    Waiting for {currentPlayer?.addr.slice(0, 8)}... to play
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Discarded Cards (Public Info) */}
        {room.status === GameStatus.PLAYING && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2 text-slate-400">
              Discarded Cards (Public)
            </h3>
            <div className="flex flex-wrap gap-2">
              {room.players.map((player) => (
                <div key={player.addr} className="text-xs">
                  <span className="text-slate-500">{player.addr.slice(0, 6)}:</span>{" "}
                  {player.discarded.length > 0
                    ? player.discarded.map((c) => CardNames[c]).join(", ")
                    : "-"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Info */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">
              Deck: {room.deck_indices.length} cards
            </span>
            <span className="text-slate-400">
              Tokens to Win: {room.tokens_to_win}
            </span>
          </div>
        </div>

        {/* Back to Lobby */}
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => router.push("/rooms_v4")}>
            Back to Lobby
          </Button>
        </div>
      </div>
    </div>
  );
}
