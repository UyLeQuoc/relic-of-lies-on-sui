"use client";

import { cn } from "@/lib/utils";
import { RarityColors, RarityNames, RarityGlow } from "@/lib/gacha";
import type { CardNFT } from "@/hooks/use-game-contract";
import { CardNames } from "@/hooks/use-game-contract";
import { mistToSui } from "@/lib/gacha";
import { Check } from "lucide-react";

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface NFTCardProps {
  card: CardNFT;
  price?: bigint;
  onClick: () => void;
  showStats?: boolean;
  variant?: "collection" | "marketplace";
  isUpgradeMode?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
}

export function NFTCard({
  card,
  price,
  onClick,
  showStats = false,
  variant = "collection",
  isUpgradeMode = false,
  isSelectable = true,
  isSelected = false,
}: NFTCardProps) {
  const isDisabled = isUpgradeMode && !isSelectable && !isSelected;

  return (
    <div
      onClick={() => onClick()}
      className={cn(
        "relative w-32 h-44 cursor-pointer group",
        isDisabled && "opacity-30 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-lg overflow-hidden transition-all duration-300",
          !isDisabled && "group-hover:scale-105 group-hover:-translate-y-1",
          isSelected &&
            "ring-2 ring-offset-2 ring-offset-background ring-emerald-500"
        )}
        style={{
          backgroundColor: "#1a1a2e",
          border: `2px solid ${RarityColors[card.rarity]}`,
          boxShadow: RarityGlow[card.rarity],
        }}
      >
        <img
          src={`/images/cards/characters/${card.value}.png`}
          alt={CardNames[card.value]}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
          <p
            className="text-xs font-bold text-center"
            style={{ color: RarityColors[card.rarity] }}
          >
            {RarityNames[card.rarity]}
          </p>
          <p className="text-xs text-center text-white/80">
            {CardNames[card.value]}
          </p>
          {price !== undefined && (
            <p className="text-xs text-center text-yellow-400 font-bold mt-1">
              {mistToSui(price).toFixed(2)} SUI
            </p>
          )}
        </div>

        {showStats && (
          <div className="absolute top-2 left-2 right-2 flex gap-1 text-[10px]">
            <div className="flex-1 bg-black/60 rounded px-1 py-0.5 text-center">
              <span className="text-emerald-400 font-bold">
                {card.wins.toString()}
              </span>
              <span className="text-white/70">W</span>
            </div>
            <div className="flex-1 bg-black/60 rounded px-1 py-0.5 text-center">
              <span className="text-blue-400 font-bold">
                {card.games_played.toString()}
              </span>
              <span className="text-white/70">G</span>
            </div>
          </div>
        )}

        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] text-muted-foreground font-mono truncate">
          {shortenAddress(card.id.id)}
        </p>
      </div>
    </div>
  );
}
