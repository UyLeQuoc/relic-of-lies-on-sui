"use client";

import * as React from "react";
import { type Player, type GameCard } from "@/components/game/game-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardCharacter } from "@/components/common/game-ui/cards/card-character";
import { CardType, CardConceptType, cardsMap } from "@/components/common/game-ui/cards/types";

// Card data mapping for display
const CARD_DATA_MAP: Record<number, { name: string; description: string }> = {
  0: { name: "Spy", description: "At round end, if only you played or discarded a Spy, gain 1 token." },
  1: { name: "Guard", description: "Name a card (except Guard). If that target holds it, they are eliminated." },
  2: { name: "Priest", description: "Choose and privately look at another player's hand." },
  3: { name: "Baron", description: "Privately compare hands with another player. Lower card is eliminated." },
  4: { name: "Handmaid", description: "You are immune to all card effects until your next turn." },
  5: { name: "Prince", description: "Choose any player. They discard their card and draw a new one." },
  6: { name: "Chancellor", description: "Draw 2 cards, keep 1, return 2 to bottom of deck." },
  7: { name: "King", description: "Trade hands with another player." },
  8: { name: "Countess", description: "Must be discarded if you have King or Prince." },
  9: { name: "Princess", description: "If discarded (by you or forced), you are eliminated." },
};

// Map card value to CardType enum for design system
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

// Helper function to format address: 0xd4f5...9a76
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface GameTableProps {
  playerCount: number;
  players: Player[];
  currentPlayerIndex: number;
  myPlayerIndex: number;
  selectedTarget: number | null;
  onSelectTarget?: (targetId: number) => void;
  isSelectingTarget?: boolean;
  selectedCardValue?: number | null; // Card value to allow self-targeting (e.g., Prince = 5)
  opponentCards?: { [key: number]: number };
  deckCount?: number;
  discardCount?: number;
  discardPile?: GameCard[];
  showStartRoundButton?: boolean;
  onStartRound?: () => void;
  isStartingRound?: boolean;
  isGameEnd?: boolean;
  onStartNewGame?: () => void;
  winnerName?: string | null;
}

export function GameTable({
  players,
  currentPlayerIndex,
  myPlayerIndex,
  selectedTarget,
  onSelectTarget,
  isSelectingTarget = false,
  selectedCardValue = null,
  opponentCards = {},
  deckCount = 0,
  discardCount = 0,
  discardPile = [],
  showStartRoundButton = false,
  onStartRound,
  isStartingRound = false,
  isGameEnd = false,
  onStartNewGame,
  winnerName = null,
}: GameTableProps) {
  const [showDiscardModal, setShowDiscardModal] = React.useState(false);
  // Separate players: opponents (around table) - human player is shown in Card Hand at bottom and South position
  const opponents = players.filter((_, idx) => idx !== myPlayerIndex);
  const humanPlayer = players[myPlayerIndex];
  
  // Prince (card value 5) can target self
  const canTargetSelf = selectedCardValue === 5;

  // Calculate positions based on player count
  // Human player is always at South (bottom)
  // 3 players: opponents at East and West
  // 4 players: opponents at East, West, and North
  const getOpponentPosition = (index: number, total: number): { className?: string; style?: React.CSSProperties } => {
    if (total === 1) {
      // 2 players total: 1 opponent at North (top center)
      return { className: "top-4 left-1/2 -translate-x-1/2" };
    }
    if (total === 2) {
      // 3 players total: 2 opponents at West (Tây) and East (Đông)
      const positions: { className?: string; style?: React.CSSProperties }[] = [
        { className: "top-1/2 left-4 -translate-y-1/2" },   // West (Tây) - left side, vertical center
        { className: "top-1/2 right-4 -translate-y-1/2" }, // East (Đông) - right side, vertical center
      ];
      return positions[index] ?? positions[0] ?? { className: "top-4 left-1/2 -translate-x-1/2" };
    }
    if (total === 3) {
      // 4 players total: 3 opponents at West (Tây), North (Bắc), East (Đông)
      const positions: { className?: string; style?: React.CSSProperties }[] = [
        { className: "top-1/2 left-4 -translate-y-1/2" },   // West (Tây) - left side, vertical center
        { className: "top-4 left-1/2 -translate-x-1/2" },  // North (Bắc) - top center
        { className: "top-1/2 right-4 -translate-y-1/2" }, // East (Đông) - right side, vertical center
      ];
      return positions[index] ?? positions[0] ?? { className: "top-4 left-1/2 -translate-x-1/2" };
    }
    // 5+ players: distribute evenly from East to West at North
    // Calculate positions evenly spaced from left to right at the top
    const startPercent = 15; // Start from 15% from left
    const endPercent = 85;   // End at 85% from left
    const spacing = total > 1 ? (endPercent - startPercent) / (total - 1) : 50;
    const leftPercent = total === 1 ? 50 : startPercent + (index * spacing);
    
    return {
      style: {
        top: '4%',
        left: `${leftPercent}%`,
        transform: 'translate(-50%, 0)',
      },
    };
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Table background */}
      <div className="absolute inset-0 from-amber-900/20 to-amber-950/30 rounded-full border-4 border-amber-700/50" />

      {/* Opponents around the table */}
      {opponents.map((player, idx) => {
        const actualIndex = players.findIndex((p) => p.id === player.id);
        const isActive = actualIndex === currentPlayerIndex && !player.isEliminated;
        const isTargeted = selectedTarget === actualIndex;
        const isClickable = isSelectingTarget && !player.isEliminated && !player.isProtected;
        const position = getOpponentPosition(idx, opponents.length);

        return (
          <div
            key={player.id}
            className={cn(
              "absolute flex flex-col items-center gap-2 transition-all",
              position.className,
              isActive && "scale-110 z-10"
            )}
            style={position.style}
          >
            {/* Avatar and Card Container */}
            <div className="flex items-center gap-2 relative">
              {/* Arrow animation pointing up to clickable target - below avatar center */}
              {isClickable && (
                <div 
                  className="absolute bottom-0 left-3/10 -translate-x-1/2 -mb-10 z-20 animate-bounce"
                  style={{
                    animation: 'bounce 1s infinite',
                  }}
                >
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="text-amber-400 drop-shadow-lg"
                  >
                    <path 
                      d="M12 2L12 22M12 2L6 8M12 2L18 8" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
              
              {/* Circular player avatar */}
              <div
                className={cn(
                  "relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all shadow-lg",
                  isActive
                    ? "border-amber-400 from-amber-400 to-amber-600 scale-110 shadow-amber-400/50"
                    : isClickable
                      ? "border-amber-500 from-slate-700 to-slate-800 hover:border-amber-400 hover:shadow-amber-400/30 cursor-pointer hover:scale-105"
                      : "border-amber-600/50 from-slate-700/50 to-slate-800/50",
                  player.isEliminated && "opacity-50 grayscale",
                  player.isProtected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900",
                  isTargeted && "ring-4 ring-green-400"
                )}
                onClick={() => isClickable && onSelectTarget?.(actualIndex)}
              >
                {/* Player initial or icon */}
                <span className="text-xl md:text-2xl font-bold text-amber-100">
                  {player.name === 'You' ? '👤' : player.name.slice(0, 1)}
                </span>
                
                {/* Status indicators */}
                {player.isProtected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-slate-900">
                    <span className="text-xs">🛡️</span>
                  </div>
                )}
                {player.isEliminated && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center border-2 border-slate-900">
                    <span className="text-xs">💀</span>
                  </div>
                )}
              </div>

              {/* Opponent card count - Right side of avatar */}
              {opponentCards[actualIndex] !== undefined && (
                <div className="relative">
                  <div className="w-8 h-10 md:w-10 md:h-12 rounded-md from-slate-700 to-slate-800 border border-amber-600/50 flex items-center justify-center">
                    <span className="text-lg md:text-xl">🂠</span>
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-md text-[10px]">
                    {opponentCards[actualIndex]}
                  </div>
                </div>
              )}
            </div>
            
            {/* Player info */}
            <div className="flex flex-col items-center gap-0.5">
              <a
                href={`https://testnet.suivision.xyz/account/${player.id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // Prevent triggering target selection
                className="text-xs font-mono text-amber-400/70 hover:text-amber-400 hover:underline transition-colors cursor-pointer"
              >
                {formatAddress(player.id)}
              </a>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: player.hearts }, (_, i) => (
                  <span key={`heart-${player.id}-${i}`} className="text-red-500 text-xs">
                    ❤️
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Center area - Deck, Discard Pile, and Start Round/New Game Button */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-0">
        {/* Start New Round Button - Center */}
        {showStartRoundButton && onStartRound ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={onStartRound}
              disabled={isStartingRound}
              size="lg"
              className="from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-4 text-base md:text-lg shadow-xl"
            >
              {isStartingRound ? 'Starting New Round...' : 'Start New Round'}
            </Button>
            {isGameEnd && (
              <p className="text-center text-amber-400 font-semibold text-sm mt-2">Game Ended!</p>
            )}
          </div>
        ) : isGameEnd && onStartNewGame ? (
          <div className="flex flex-col items-center gap-2">
            {winnerName && (
              <p className="text-center text-amber-400 font-semibold text-lg mb-2">
                {winnerName} Won!
              </p>
            )}
            <Button
              onClick={onStartNewGame}
              size="lg"
              className="from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-6 py-4 text-base md:text-lg shadow-xl"
            >
              Start New Game
            </Button>
          </div>
        ) : (
          /* Deck and Discard Pile */
          <div className="flex items-end gap-4 md:gap-6">
          {/* Deck - Using card back from design system */}
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <div 
                className="h-[180px] rounded-lg overflow-hidden shadow-xl"
                style={{ aspectRatio: '2/3' }}
              >
                <img
                  src={cardsMap[CardConceptType.RelicOfLies].cardBack}
                  alt="Deck"
                  className="h-full w-full object-cover rounded-lg"
                />
              </div>
              {deckCount > 0 && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-lg text-sm z-10">
                  {deckCount}
                </div>
              )}
            </div>
            <p className="text-center mt-1 text-xs text-amber-400 font-medium">
              Deck
            </p>
          </div>

          {/* Discard Pile */}
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() => discardCount > 0 && setShowDiscardModal(true)}
              disabled={discardCount === 0}
              className={cn(
                "relative transition-all",
                discardCount > 0
                  ? "hover:scale-105 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              {discardCount > 0 && discardPile.length > 0 ? (
                // Show the latest discarded card using design system
                (() => {
                  const latestCard = discardPile[discardPile.length - 1];
                  if (!latestCard) return (
                    <div 
                      className="h-[140px] rounded-lg border-2 border-dashed border-amber-600/30 bg-slate-800/30 flex items-center justify-center"
                      style={{ aspectRatio: '2/3' }}
                    >
                      <span className="text-amber-400/70 text-sm font-medium">Empty</span>
                    </div>
                  );
                  return (
                    <div className="relative">
                      <CardCharacter
                        cardType={mapCardValueToCardType(latestCard.value)}
                        size="xs"
                      />
                      {/* Show count badge if more than 1 card */}
                      {discardCount > 1 && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-lg text-sm z-10">
                          {discardCount}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div 
                  className="h-[180px] rounded-lg border-2 border-dashed border-amber-600/30 bg-slate-800/30 flex items-center justify-center"
                  style={{ aspectRatio: '2/3' }}
                >
                  <span className="text-amber-400/70 text-sm font-medium">Empty</span>
                </div>
              )}
            </button>
            <p className="text-center mt-1 text-xs text-amber-400 font-medium">
              Discard
            </p>
          </div>
          </div>
        )}
      </div>

      {/* Human player at Southwest position */}
      {humanPlayer && (
        <div
          className={cn(
            "absolute bottom-4 left-80 flex flex-col items-center gap-2 transition-all",
            myPlayerIndex === currentPlayerIndex && !humanPlayer.isEliminated && "scale-110 z-10"
          )}
        >
          {/* Circular player avatar */}
          <div
            className={cn(
              "relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all shadow-lg",
              myPlayerIndex === currentPlayerIndex && !humanPlayer.isEliminated
                ? "border-amber-400 from-amber-400 to-amber-600 scale-110 shadow-amber-400/50"
                : isSelectingTarget && canTargetSelf && !humanPlayer.isEliminated
                  ? "border-amber-500 from-slate-700 to-slate-800 hover:border-amber-400 hover:shadow-amber-400/30 cursor-pointer hover:scale-105"
                  : "border-amber-600/50 from-slate-700/50 to-slate-800/50",
              humanPlayer.isEliminated && "opacity-50 grayscale",
              humanPlayer.isProtected && "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900",
              selectedTarget === myPlayerIndex && "ring-4 ring-green-400"
            )}
            onClick={() => {
              // Prince (card value 5) can target self even when protected
              if (isSelectingTarget && canTargetSelf && !humanPlayer.isEliminated) {
                onSelectTarget?.(myPlayerIndex);
              }
            }}
          >
            {/* Arrow animation pointing up to self when clickable (Prince) - from below (opposite of opponents) */}
            {isSelectingTarget && canTargetSelf && !humanPlayer.isEliminated && (
              <div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-20 z-20 animate-bounce"
                style={{
                  animation: 'bounce 1s infinite',
                }}
              >
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="text-amber-400 drop-shadow-lg"
                  style={{ transform: 'rotate(180deg)' }}
                >
                  <path 
                    d="M12 2L12 22M12 2L6 8M12 2L18 8" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            
            {/* Player initial or icon */}
            <span className="text-xl md:text-2xl font-bold text-amber-100">
              👤
            </span>
            
            {/* Status indicators */}
            {humanPlayer.isProtected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-slate-900">
                <span className="text-xs">🛡️</span>
              </div>
            )}
            {humanPlayer.isEliminated && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center border-2 border-slate-900">
                <span className="text-xs">💀</span>
              </div>
            )}
          </div>
          
          {/* Player info */}
          <div className="flex flex-col items-center gap-0.5">
            <a
              href={`https://testnet.suivision.xyz/account/${humanPlayer.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()} // Prevent triggering target selection
              className="text-xs font-mono text-amber-400/70 hover:text-amber-400 hover:underline transition-colors cursor-pointer"
            >
              {formatAddress(humanPlayer.id)}
            </a>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: humanPlayer.hearts }, (_, i) => (
                <span key={`heart-${humanPlayer.id}-${i}`} className="text-red-500 text-xs">
                  ❤️
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discard Pile Modal */}
      {showDiscardModal && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDiscardModal(false)}
        >
          <div 
            className="bg-slate-900 border-2 border-amber-600 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 min-w-56">
              <h3 className="text-xl font-bold text-amber-400">Discarded Cards ({discardPile.length})</h3>
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="text-amber-400 hover:text-amber-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {discardPile.map((card) => {
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
            {discardPile.length === 0 && (
              <p className="text-center text-amber-400/70 mt-4">No cards discarded yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

