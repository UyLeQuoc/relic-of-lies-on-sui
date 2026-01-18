"use client";

import { Sparkles } from "lucide-react";
import { CardNames, type CardNFT } from "@/hooks/use-game-contract-v4";
import { RarityColors, RarityNames, RarityGlow } from "@/lib/gacha";

interface PulledCard extends CardNFT {
  isNew?: boolean;
}

interface GachaCardProps {
  card: PulledCard;
  isFlipped: boolean;
  onClick: (cardId: string, element: HTMLElement) => void;
}

export function GachaCard({ card, isFlipped, onClick }: GachaCardProps) {
  return (
    <div
      data-card
      onClick={(e) => onClick(card.id.id, e.currentTarget)}
      className="relative w-32 h-44 cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div
        className="absolute inset-0 rounded-lg overflow-hidden transition-transform hover:scale-105"
        style={{
          backfaceVisibility: "hidden",
          backgroundColor: "#1a1a2e",
          border: "2px solid #444",
        }}
      >
        <img
          src="/images/cards/frames/card-back.png"
          alt="Card Back"
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          backgroundColor: "#1a1a2e",
          border: `2px solid ${RarityColors[card.rarity]}`,
          boxShadow: isFlipped ? RarityGlow[card.rarity] : "none",
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
        </div>
        {card.isNew && (
          <div className="absolute top-1 right-1">
            <Sparkles
              className="w-4 h-4"
              style={{ color: RarityColors[card.rarity] }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
