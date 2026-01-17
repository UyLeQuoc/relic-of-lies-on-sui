"use client";

import type * as React from "react";
import { type Player } from "@/components/game/game-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GameTableProps {
  playerCount: number;
  players: Player[];
  currentPlayerIndex: number;
  myPlayerIndex: number;
  selectedTarget: number | null;
  onSelectTarget?: (targetId: number) => void;
  isSelectingTarget?: boolean;
  opponentCards?: { [key: number]: number };
  deckCount?: number;
  discardCount?: number;
  showStartRoundButton?: boolean;
  onStartRound?: () => void;
  isStartingRound?: boolean;
  isGameEnd?: boolean;
}

export function GameTable({
  playerCount,
  players,
  currentPlayerIndex,
  myPlayerIndex,
  selectedTarget,
  onSelectTarget,
  isSelectingTarget = false,
  opponentCards = {},
  deckCount = 0,
  discardCount = 0,
  showStartRoundButton = false,
  onStartRound,
  isStartingRound = false,
  isGameEnd = false,
}: GameTableProps) {
  // Separate players: human player (bottom) and opponents (around table)
  const humanPlayer = players[myPlayerIndex];
  const opponents = players.filter((_, idx) => idx !== myPlayerIndex);

  // Calculate positions based on player count
  // Human player is always at South (bottom), opponents are distributed North (top) from East to West
  const getOpponentPosition = (index: number, total: number): { className?: string; style?: React.CSSProperties } => {
    if (total === 1) {
      // 2 players total: 1 opponent at North (top center)
      return { className: "top-4 left-1/2 -translate-x-1/2" };
    }
    if (total === 2) {
      // 3 players total: 2 opponents at Northeast (Đông Bắc) and Northwest (Tây Bắc)
      const positions = [
        { className: "top-4 left-1/4 -translate-x-1/2" },  // Northwest (Tây Bắc) - left side
        { className: "top-4 right-1/4 translate-x-1/2" },  // Northeast (Đông Bắc) - right side
      ];
      return positions[index] || positions[0];
    }
    if (total === 3) {
      // 4 players total: 3 opponents at West (Tây), North (Bắc), East (Đông)
      const positions = [
        { className: "top-4 left-4" },                      // West (Tây) - left
        { className: "top-4 left-1/2 -translate-x-1/2" },  // North (Bắc) - center
        { className: "top-4 right-4" },                     // East (Đông) - right
      ];
      return positions[index] || positions[0];
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
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-amber-950/30 rounded-full border-4 border-amber-700/50" />

      {/* Opponents around the table */}
      {opponents.map((player, idx) => {
        const actualIndex = players.findIndex((p) => p.id === player.id);
        const isActive = actualIndex === currentPlayerIndex && !player.isEliminated;
        const isTargeted = selectedTarget === actualIndex;
        const isClickable = isSelectingTarget && !player.isEliminated && !player.isProtected && actualIndex !== myPlayerIndex;
        const position = getOpponentPosition(idx, opponents.length);

        return (
          <div
            key={player.id}
            className={cn(
              "absolute flex flex-col items-center gap-1 transition-all",
              position.className,
              isClickable && "cursor-pointer",
              isActive && "scale-110 z-10",
              isTargeted && "ring-4 ring-green-400 rounded-lg p-2",
              isClickable && "hover:scale-105"
            )}
            style={position.style}
            onClick={() => isClickable && onSelectTarget?.(actualIndex)}
          >
            <div
              className={cn(
                "w-16 h-20 md:w-20 md:h-24 rounded-lg border-2 flex flex-col items-center justify-center bg-gradient-to-br transition-all",
                isActive
                  ? "border-amber-400 bg-gradient-to-br from-amber-400 to-amber-600 scale-110"
                  : isClickable
                    ? "border-amber-500 bg-gradient-to-br from-slate-700 to-slate-800 hover:border-amber-400"
                    : "border-amber-600/50 bg-gradient-to-br from-slate-700/50 to-slate-800/50",
                player.isEliminated && "opacity-50",
                player.isProtected && "ring-2 ring-blue-400"
              )}
            >
              <span className="text-lg md:text-xl">{player.name}</span>
              {player.isProtected && (
                <span className="text-xs text-blue-400">🛡️</span>
              )}
              {player.isEliminated && (
                <span className="text-xs text-red-400">💀</span>
              )}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: player.hearts }, (_, i) => (
                <span key={`heart-${player.id}-${i}`} className="text-red-500 text-xs">
                  ❤️
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-400 font-semibold mt-0.5">
              {player.hearts} điểm
            </p>
            {opponentCards[actualIndex] !== undefined && (
              <span className="text-xs text-amber-400/70">
                {opponentCards[actualIndex]} cards
              </span>
            )}
          </div>
        );
      })}

      {/* Center area - Deck, Discard Pile, and Start Round Button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-0">
        {/* Start New Round Button - Center */}
        {showStartRoundButton && onStartRound && (
          <div className="absolute -top-20 md:-top-24 left-1/2 -translate-x-1/2 z-20">
            <Button
              onClick={onStartRound}
              disabled={isStartingRound}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-6 py-4 text-base md:text-lg shadow-xl"
            >
              {isStartingRound ? 'Starting New Round...' : 'Start New Round'}
            </Button>
            {isGameEnd && (
              <p className="text-center text-amber-400 font-semibold text-sm mt-2">Game Ended!</p>
            )}
          </div>
        )}

        {/* Deck and Discard Pile */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Deck */}
          <div className="relative">
            <div className="relative w-20 h-28 md:w-24 md:h-36 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-amber-600 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-600/20 border-2 border-amber-600 flex items-center justify-center">
                  <span className="text-xl md:text-2xl">🂠</span>
                </div>
              </div>
              {deckCount > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center shadow-lg text-xs md:text-sm">
                  {deckCount}
                </div>
              )}
            </div>
            <p className="text-center mt-1 text-xs text-amber-400 font-medium">
              Deck
            </p>
          </div>

          {/* Discard Pile */}
          <div className="relative">
            <div className="relative w-20 h-28 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-amber-600/50 flex items-center justify-center bg-slate-800/50">
              {discardCount > 0 ? (
                <span className="text-amber-400/70 text-xs md:text-sm font-semibold">
                  {discardCount}
                </span>
              ) : (
                <span className="text-amber-600/30 text-xs">Empty</span>
              )}
            </div>
            <p className="text-center mt-1 text-xs text-amber-400 font-medium">
              Discard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
