"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { CardNames, Rarity, type CardNFT } from "@/hooks/use-game-contract";
import { useCollection } from "@/hooks/use-collection";
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
}: {
  card: CardNFT;
  onClick: (card: CardNFT) => void;
}) {
  return (
    <div
      onClick={() => onClick(card)}
      className="relative w-32 h-44 cursor-pointer group"
    >
      <div
        className="absolute inset-0 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1"
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
}: {
  rarity: number;
  cards: CardNFT[];
  onCardClick: (card: CardNFT) => void;
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
          <CollectionCard key={card.id.id} card={card} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

export function MyCollectionContent() {
  const currentAccount = useCurrentAccount();
  const { cards, isLoading, fetchCards } = useCollection();
  const [selectedCard, setSelectedCard] = useState<CardNFT | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const cardsByRarity = useMemo(() => {
    const grouped: CardsByRarity = {
      [Rarity.MYTHIC]: [],
      [Rarity.LEGENDARY]: [],
      [Rarity.EPIC]: [],
      [Rarity.RARE]: [],
      [Rarity.COMMON]: [],
    };

    for (const card of cards) {
      const rarityGroup = grouped[card.rarity];
      if (rarityGroup) {
        rarityGroup.push(card);
      }
    }

    return grouped;
  }, [cards]);

  const handleCardClick = useCallback((card: CardNFT) => {
    setSelectedCard(card);
    setSheetOpen(true);
  }, []);

  const totalCards = cards.length;

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
              : `${totalCards} cards in your collection`}
          </p>
        </div>

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
        ) : (
          <div className="space-y-10">
            <RaritySection
              rarity={Rarity.MYTHIC}
              cards={cardsByRarity[Rarity.MYTHIC] ?? []}
              onCardClick={handleCardClick}
            />
            <RaritySection
              rarity={Rarity.LEGENDARY}
              cards={cardsByRarity[Rarity.LEGENDARY] ?? []}
              onCardClick={handleCardClick}
            />
            <RaritySection
              rarity={Rarity.EPIC}
              cards={cardsByRarity[Rarity.EPIC] ?? []}
              onCardClick={handleCardClick}
            />
            <RaritySection
              rarity={Rarity.RARE}
              cards={cardsByRarity[Rarity.RARE] ?? []}
              onCardClick={handleCardClick}
            />
            <RaritySection
              rarity={Rarity.COMMON}
              cards={cardsByRarity[Rarity.COMMON] ?? []}
              onCardClick={handleCardClick}
            />
          </div>
        )}
      </div>

      <CardDetailSheet
        card={selectedCard}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
