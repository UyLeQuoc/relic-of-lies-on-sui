"use client";

import { CardNames, Rarity, type CardNFT } from "@/hooks/use-game-contract";
import { RarityColors, RarityNames, RarityGlow } from "@/lib/gacha";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Upgrade success rates from contract
// Common→Rare 80%, Rare→Epic 60%, Epic→Legendary 40%, Legendary→Mythic 20%
const UPGRADE_SUCCESS_RATES: Record<number, number> = {
  [Rarity.COMMON]: 80,
  [Rarity.RARE]: 60,
  [Rarity.EPIC]: 40,
  [Rarity.LEGENDARY]: 20,
  [Rarity.MYTHIC]: 0,
};

interface UpgradePanelProps {
  isUpgradeMode: boolean;
  firstSelectedCard: CardNFT | null;
  secondSelectedCard: CardNFT | null;
  thirdSelectedCard: CardNFT | null;
  nextRarity: number | null;
  canUpgrade: boolean;
  selectableCardsCount: number;
  selectedCount: number;
  remainingCount: number;
  isUpgrading?: boolean;
  onExitUpgradeMode: () => void;
  onClearSelection: () => void;
  onPerformUpgrade: () => void;
}

function UpgradeCardSlot({
  card,
  placeholder,
}: {
  card: CardNFT | null;
  placeholder: string;
}) {
  const rarity = card?.rarity;
  const borderColor =
    rarity !== null && rarity !== undefined ? RarityColors[rarity] : "#444";
  const glow =
    rarity !== null && rarity !== undefined ? RarityGlow[rarity] : "none";

  return (
    <div
      className={cn(
        "relative w-32 h-44 rounded-lg overflow-hidden transition-all duration-300",
        !card && "border-2 border-dashed border-muted-foreground/30"
      )}
      style={{
        backgroundColor: card ? "#1a1a2e" : "transparent",
        border: card ? `2px solid ${borderColor}` : undefined,
        boxShadow: card ? glow : "none",
      }}
    >
      {card ? (
        <>
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
            <p className="text-xs text-center text-white/80 truncate">
              {CardNames[card.value]}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <Plus className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground/50 mt-2 text-center px-2">
            {placeholder}
          </p>
        </div>
      )}
    </div>
  );
}

function ResultCardSlot({
  resultRarity,
  currentRarity,
  isFullySelected,
  remainingCount,
}: {
  resultRarity: number | null;
  currentRarity: number | null;
  isFullySelected: boolean;
  remainingCount: number;
}) {
  const successRate =
    currentRarity !== null ? (UPGRADE_SUCCESS_RATES[currentRarity] ?? 0) : 0;
  const hasResult = resultRarity !== null && resultRarity !== undefined;
  const borderColor = hasResult ? RarityColors[resultRarity] : "#444";
  const glow = hasResult && isFullySelected ? RarityGlow[resultRarity] : "none";
  const bgColor = hasResult ? RarityColors[resultRarity] : "#666";

  return (
    <div
      className="relative w-32 h-44 rounded-lg overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "#1a1a2e",
        border: `2px solid ${borderColor}`,
        boxShadow: glow,
      }}
    >
      {/* Background fill based on percentage - only show when fully selected */}
      {isFullySelected && (
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500"
          style={{
            height: `${successRate}%`,
            backgroundColor: `${bgColor}20`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full z-10">
        {isFullySelected && hasResult ? (
          <>
            <p
              className="text-4xl font-bold"
              style={{ color: RarityColors[resultRarity] }}
            >
              {successRate}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Success Rate</p>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
              <p
                className="text-xs font-bold text-center"
                style={{ color: RarityColors[resultRarity] }}
              >
                {RarityNames[resultRarity]}
              </p>
              <p className="text-xs text-center text-white/80">Result</p>
            </div>
          </>
        ) : hasResult ? (
          <>
            <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground/50 mt-2 text-center px-2">
              Select {remainingCount} more
            </p>
          </>
        ) : (
          <>
            <Sparkles className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground/50 mt-2">Result</p>
          </>
        )}
      </div>
    </div>
  );
}

export function UpgradePanel({
  isUpgradeMode,
  firstSelectedCard,
  secondSelectedCard,
  thirdSelectedCard,
  nextRarity,
  canUpgrade,
  selectableCardsCount,
  selectedCount,
  remainingCount,
  isUpgrading,
  onExitUpgradeMode,
  onClearSelection,
  onPerformUpgrade,
}: UpgradePanelProps) {
  if (!isUpgradeMode) return null;

  const hasAnyCard = selectedCount > 0;
  const currentRarity = firstSelectedCard?.rarity ?? null;

  const getMessage = () => {
    if (selectedCount === 0) {
      return "Select 3 cards with the same role and rarity to upgrade";
    }
    if (selectedCount < 3) {
      return `Select ${remainingCount} more ${CardNames[firstSelectedCard!.value]} (${RarityNames[firstSelectedCard!.rarity]}) • ${selectableCardsCount} available`;
    }
    return "Ready to upgrade!";
  };

  return (
    <div className="p-4 sm:p-6 bg-muted/30 rounded-lg border border-muted-foreground/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold font-god-of-war tracking-wider">
            Upgrade Mode
          </h3>
          <p className="text-sm text-muted-foreground">{getMessage()}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExitUpgradeMode}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
        <UpgradeCardSlot card={firstSelectedCard} placeholder="Select 1st" />

        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground shrink-0" />

        <UpgradeCardSlot card={secondSelectedCard} placeholder="Select 2nd" />

        <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground shrink-0" />

        <UpgradeCardSlot card={thirdSelectedCard} placeholder="Select 3rd" />

        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground shrink-0" />

        <ResultCardSlot
          resultRarity={nextRarity}
          currentRarity={currentRarity}
          isFullySelected={selectedCount === 3}
          remainingCount={remainingCount}
        />
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        {hasAnyCard && (
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        )}
        <Button
          size="sm"
          disabled={!canUpgrade || isUpgrading}
          onClick={onPerformUpgrade}
          className={cn(
            canUpgrade &&
              !isUpgrading &&
              "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          )}
        >
          <Sparkles
            className={cn("w-4 h-4 mr-2", isUpgrading && "animate-spin")}
          />
          {isUpgrading ? "Upgrading..." : "Upgrade Card"}
        </Button>
      </div>

      {firstSelectedCard && firstSelectedCard.rarity === Rarity.MYTHIC && (
        <p className="text-center text-sm text-destructive mt-4">
          Mythic cards cannot be upgraded further
        </p>
      )}
    </div>
  );
}
