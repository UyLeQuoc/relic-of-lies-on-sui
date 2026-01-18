"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  CardNames,
  CardType,
  Rarity,
  type CardNFT,
} from "@/hooks/use-game-contract";
import { useCollection } from "@/hooks/use-collection";
import { useUpgrade } from "@/hooks/use-upgrade";
import { RarityColors, RarityNames, RarityGlow } from "@/lib/gacha";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradePanel } from "./upgrade-panel";
import { UpgradeAnimation } from "./upgrade-animation";

const RARITY_OPTIONS = [
  {
    value: String(Rarity.MYTHIC),
    label: "Mythic",
    color: RarityColors[Rarity.MYTHIC],
  },
  {
    value: String(Rarity.LEGENDARY),
    label: "Legendary",
    color: RarityColors[Rarity.LEGENDARY],
  },
  {
    value: String(Rarity.EPIC),
    label: "Epic",
    color: RarityColors[Rarity.EPIC],
  },
  {
    value: String(Rarity.RARE),
    label: "Rare",
    color: RarityColors[Rarity.RARE],
  },
  {
    value: String(Rarity.COMMON),
    label: "Common",
    color: RarityColors[Rarity.COMMON],
  },
];

const ROLE_OPTIONS = [
  { value: String(CardType.SPY), label: CardNames[CardType.SPY] },
  { value: String(CardType.GUARD), label: CardNames[CardType.GUARD] },
  { value: String(CardType.PRIEST), label: CardNames[CardType.PRIEST] },
  { value: String(CardType.BARON), label: CardNames[CardType.BARON] },
  { value: String(CardType.HANDMAID), label: CardNames[CardType.HANDMAID] },
  { value: String(CardType.PRINCE), label: CardNames[CardType.PRINCE] },
  { value: String(CardType.CHANCELLOR), label: CardNames[CardType.CHANCELLOR] },
  { value: String(CardType.KING), label: CardNames[CardType.KING] },
  { value: String(CardType.COUNTESS), label: CardNames[CardType.COUNTESS] },
  { value: String(CardType.PRINCESS), label: CardNames[CardType.PRINCESS] },
];

function shortenAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface CardsByRarity {
  [key: number]: CardNFT[];
}

function CollectionCard({
  card,
  onClick,
  isUpgradeMode,
  isSelectable,
  isSelected,
}: {
  card: CardNFT;
  onClick: (card: CardNFT) => void;
  isUpgradeMode?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
}) {
  const isDisabled = isUpgradeMode && !isSelectable && !isSelected;

  return (
    <div
      onClick={() => onClick(card)}
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
        </div>

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

function CardDetailSheet({
  card,
  open,
  onOpenChange,
}: {
  card: CardNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!card) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle
            className="text-xl font-god-of-war"
            style={{ color: RarityColors[card.rarity] }}
          >
            {CardNames[card.value]}
          </SheetTitle>
          <SheetDescription>Card Details</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-6 py-6">
            <div className="flex justify-center px-4">
              <div
                className="relative w-48 h-64 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "#1a1a2e",
                  border: `3px solid ${RarityColors[card.rarity]}`,
                  boxShadow: RarityGlow[card.rarity],
                }}
              >
                <img
                  src={`/images/cards/characters/${card.value}.png`}
                  alt={CardNames[card.value]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p
                    className="text-sm font-bold text-center"
                    style={{ color: RarityColors[card.rarity] }}
                  >
                    {RarityNames[card.rarity]}
                  </p>
                  <p className="text-sm text-center text-white/80">
                    {CardNames[card.value]}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4 px-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Object ID
                </h4>
                <p className="text-sm font-mono break-all bg-muted/50 p-3 rounded-md">
                  {card.id.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Card Value
                  </h4>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Rarity
                  </h4>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: RarityColors[card.rarity],
                      color: RarityColors[card.rarity],
                    }}
                  >
                    {RarityNames[card.rarity]}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-500">
                      {card.wins.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Wins
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-500">
                      {card.games_played.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Games Played
                    </p>
                  </div>
                </div>
              </div>

              {card.games_played > BigInt(0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Win Rate
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Performance
                      </span>
                      <span className="text-lg font-bold">
                        {(
                          (Number(card.wins) / Number(card.games_played)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${(Number(card.wins) / Number(card.games_played)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function RaritySection({
  rarity,
  cards,
  onCardClick,
  isUpgradeMode,
  isCardSelectable,
  isCardSelected,
}: {
  rarity: number;
  cards: CardNFT[];
  onCardClick: (card: CardNFT) => void;
  isUpgradeMode?: boolean;
  isCardSelectable?: (card: CardNFT) => boolean;
  isCardSelected?: (card: CardNFT) => boolean;
}) {
  if (cards.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2
          className="text-lg font-bold font-god-of-war tracking-wider"
          style={{ color: RarityColors[rarity] }}
        >
          {RarityNames[rarity]}
        </h2>
        <Badge
          variant="secondary"
          className="text-xs"
          style={{
            backgroundColor: `${RarityColors[rarity]}20`,
            color: RarityColors[rarity],
          }}
        >
          {cards.length} cards
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
        {cards.map((card) => (
          <CollectionCard
            key={card.id.id}
            card={card}
            onClick={onCardClick}
            isUpgradeMode={isUpgradeMode}
            isSelectable={isCardSelectable?.(card)}
            isSelected={isCardSelected?.(card)}
          />
        ))}
      </div>
    </div>
  );
}

function CollectionFilters({
  selectedRarity,
  selectedRole,
  rarityCounts,
  roleCounts,
  totalCards,
  isUpgradeMode,
  onRarityChange,
  onRoleChange,
  onClearFilters,
  onEnterUpgradeMode,
}: {
  selectedRarity: string | null;
  selectedRole: string | null;
  rarityCounts: Record<string, number>;
  roleCounts: Record<string, number>;
  totalCards: number;
  isUpgradeMode: boolean;
  onRarityChange: (value: string | null) => void;
  onRoleChange: (value: string | null) => void;
  onClearFilters: () => void;
  onEnterUpgradeMode: () => void;
}) {
  const hasFilters = selectedRarity !== null || selectedRole !== null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rarity:</span>
          <Select
            value={selectedRarity ?? "all"}
            onValueChange={(value) =>
              onRarityChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Rarities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities ({totalCards})</SelectItem>
              {RARITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center justify-between w-full gap-2">
                    <span style={{ color: option.color }}>{option.label}</span>
                    <span className="text-muted-foreground">
                      ({rarityCounts[option.value] ?? 0})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Role:</span>
          <Select
            value={selectedRole ?? "all"}
            onValueChange={(value) =>
              onRoleChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles ({totalCards})</SelectItem>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center justify-between w-full gap-2">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground">
                      ({roleCounts[option.value] ?? 0})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && !isUpgradeMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {!isUpgradeMode && (
        <Button size="sm" onClick={onEnterUpgradeMode} className="gap-2">
          <ArrowUpCircle className="w-4 h-4" />
          Upgrade
        </Button>
      )}
    </div>
  );
}

export function MyCollectionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentAccount = useCurrentAccount();
  const { cards, isLoading, fetchCards } = useCollection();
  const [selectedCard, setSelectedCard] = useState<CardNFT | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    isUpgradeMode,
    firstSelectedCard,
    secondSelectedCard,
    thirdSelectedCard,
    nextRarity,
    canUpgrade,
    selectableCardsCount,
    selectedCount,
    remainingCount,
    isCardSelectable,
    isCardSelected,
    selectCard,
    enterUpgradeMode,
    exitUpgradeMode,
    clearSelection,
    performUpgrade,
    isUpgrading,
    isAnimating,
    setIsAnimating,
    upgradeResult,
    onAnimationComplete,
    selectedCards,
  } = useUpgrade(cards);

  const handleUpgradeClick = useCallback(async () => {
    if (!canUpgrade) return;
    setIsAnimating(true);
    await performUpgrade();
  }, [canUpgrade, performUpgrade, setIsAnimating]);

  const handleAnimationComplete = useCallback(
    (success: boolean, newCard: CardNFT | null) => {
      onAnimationComplete();
      exitUpgradeMode();
      fetchCards();
    },
    [onAnimationComplete, exitUpgradeMode, fetchCards]
  );

  const selectedRarity = searchParams.get("rarity");
  const selectedRole = searchParams.get("role");

  const updateSearchParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const handleRarityChange = useCallback(
    (value: string | null) => {
      updateSearchParams("rarity", value);
    },
    [updateSearchParams]
  );

  const handleRoleChange = useCallback(
    (value: string | null) => {
      updateSearchParams("role", value);
    },
    [updateSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (selectedRarity !== null) {
      const rarityNum = parseInt(selectedRarity, 10);
      result = result.filter((card) => card.rarity === rarityNum);
    }

    if (selectedRole !== null) {
      const roleNum = parseInt(selectedRole, 10);
      result = result.filter((card) => card.value === roleNum);
    }

    return result;
  }, [cards, selectedRarity, selectedRole]);

  const cardsByRarity = useMemo(() => {
    const grouped: CardsByRarity = {
      [Rarity.MYTHIC]: [],
      [Rarity.LEGENDARY]: [],
      [Rarity.EPIC]: [],
      [Rarity.RARE]: [],
      [Rarity.COMMON]: [],
    };

    for (const card of filteredCards) {
      const rarityGroup = grouped[card.rarity];
      if (rarityGroup) {
        rarityGroup.push(card);
      }
    }

    return grouped;
  }, [filteredCards]);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const card of cards) {
      const key = String(card.rarity);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [cards]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const card of cards) {
      const key = String(card.value);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [cards]);

  const handleCardClick = useCallback(
    (card: CardNFT) => {
      if (isUpgradeMode) {
        selectCard(card);
      } else {
        setSelectedCard(card);
        setSheetOpen(true);
      }
    },
    [isUpgradeMode, selectCard]
  );

  const totalCards = cards.length;
  const filteredCount = filteredCards.length;
  const hasFilters = selectedRarity !== null || selectedRole !== null;

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-god-of-war tracking-wider">
            My Collection
          </h1>
          <p className="text-muted-foreground">
            Connect your wallet to view your card collection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-god-of-war tracking-wider">
            My Collection
          </h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading your cards..."
              : hasFilters
                ? `Showing ${filteredCount} of ${totalCards} cards`
                : `${totalCards} cards in your collection`}
          </p>
        </div>

        {!isLoading && totalCards > 0 && (
          <CollectionFilters
            selectedRarity={selectedRarity}
            selectedRole={selectedRole}
            rarityCounts={rarityCounts}
            roleCounts={roleCounts}
            totalCards={totalCards}
            isUpgradeMode={isUpgradeMode}
            onRarityChange={handleRarityChange}
            onRoleChange={handleRoleChange}
            onClearFilters={handleClearFilters}
            onEnterUpgradeMode={enterUpgradeMode}
          />
        )}

        <UpgradePanel
          isUpgradeMode={isUpgradeMode}
          firstSelectedCard={firstSelectedCard}
          secondSelectedCard={secondSelectedCard}
          thirdSelectedCard={thirdSelectedCard}
          nextRarity={nextRarity}
          canUpgrade={canUpgrade}
          selectableCardsCount={selectableCardsCount}
          selectedCount={selectedCount}
          remainingCount={remainingCount}
          isUpgrading={isUpgrading}
          onExitUpgradeMode={exitUpgradeMode}
          onClearSelection={clearSelection}
          onPerformUpgrade={handleUpgradeClick}
        />

        {isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="w-32 h-44 rounded-lg" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : totalCards === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🃏</div>
            <h2 className="text-2xl font-semibold">No cards yet</h2>
            <p className="text-muted-foreground">
              Pull some cards from the gacha to start your collection!
            </p>
          </div>
        ) : filteredCount === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Search className="w-10 h-10 mx-auto" />
            <h2 className="text-2xl font-semibold">
              No cards match your filters
            </h2>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more cards.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <RaritySection
              rarity={Rarity.MYTHIC}
              cards={cardsByRarity[Rarity.MYTHIC] ?? []}
              onCardClick={handleCardClick}
              isUpgradeMode={isUpgradeMode}
              isCardSelectable={isCardSelectable}
              isCardSelected={isCardSelected}
            />
            <RaritySection
              rarity={Rarity.LEGENDARY}
              cards={cardsByRarity[Rarity.LEGENDARY] ?? []}
              onCardClick={handleCardClick}
              isUpgradeMode={isUpgradeMode}
              isCardSelectable={isCardSelectable}
              isCardSelected={isCardSelected}
            />
            <RaritySection
              rarity={Rarity.EPIC}
              cards={cardsByRarity[Rarity.EPIC] ?? []}
              onCardClick={handleCardClick}
              isUpgradeMode={isUpgradeMode}
              isCardSelectable={isCardSelectable}
              isCardSelected={isCardSelected}
            />
            <RaritySection
              rarity={Rarity.RARE}
              cards={cardsByRarity[Rarity.RARE] ?? []}
              onCardClick={handleCardClick}
              isUpgradeMode={isUpgradeMode}
              isCardSelectable={isCardSelectable}
              isCardSelected={isCardSelected}
            />
            <RaritySection
              rarity={Rarity.COMMON}
              cards={cardsByRarity[Rarity.COMMON] ?? []}
              onCardClick={handleCardClick}
              isUpgradeMode={isUpgradeMode}
              isCardSelectable={isCardSelectable}
              isCardSelected={isCardSelected}
            />
          </div>
        )}
      </div>

      <CardDetailSheet
        card={selectedCard}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {isAnimating &&
        selectedCards.length === 3 &&
        selectedCards[0] &&
        selectedCards[1] &&
        selectedCards[2] && (
          <UpgradeAnimation
            cards={[selectedCards[0], selectedCards[1], selectedCards[2]]}
            isOpen={isAnimating}
            onComplete={handleAnimationComplete}
            upgradeResult={
              upgradeResult
                ? {
                    success: upgradeResult.success,
                    newCard: upgradeResult.newCard,
                  }
                : null
            }
          />
        )}
    </div>
  );
}
