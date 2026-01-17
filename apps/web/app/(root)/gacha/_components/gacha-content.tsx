"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiBalance } from "@/hooks/use-sui-balance";
import {
  useGachaPull,
  useGachaPull10,
  useGetMyCards,
  GACHA_COST,
  GACHA_COST_10,
  Rarity,
  CardNames,
  type CardNFT,
} from "@/hooks/use-game-contract";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import gsap from "gsap";

const RarityColors: Record<number, string> = {
  [Rarity.COMMON]: "#ffffff",
  [Rarity.RARE]: "#3b82f6",
  [Rarity.EPIC]: "#a855f7",
  [Rarity.LEGENDARY]: "#f97316",
  [Rarity.MYTHIC]: "#ef4444",
};

const RarityNames: Record<number, string> = {
  [Rarity.COMMON]: "Common",
  [Rarity.RARE]: "Rare",
  [Rarity.EPIC]: "Epic",
  [Rarity.LEGENDARY]: "Legendary",
  [Rarity.MYTHIC]: "Mythic",
};

const RarityGlow: Record<number, string> = {
  [Rarity.COMMON]: "0 0 20px rgba(255,255,255,0.3)",
  [Rarity.RARE]: "0 0 30px rgba(59,130,246,0.5)",
  [Rarity.EPIC]: "0 0 40px rgba(168,85,247,0.6)",
  [Rarity.LEGENDARY]: "0 0 50px rgba(249,115,22,0.7)",
  [Rarity.MYTHIC]: "0 0 60px rgba(239,68,68,0.8)",
};

interface PulledCard extends CardNFT {
  isNew?: boolean;
}

export function GachaContent() {
  const currentAccount = useCurrentAccount();
  const { balance, refetch: refetchBalance } = useSuiBalance(
    currentAccount?.address
  );
  const { pull, isPending: isPulling } = useGachaPull();
  const { pull10, isPending: isPulling10 } = useGachaPull10();
  const { cards, fetchCards } = useGetMyCards();

  const [pulledCards, setPulledCards] = useState<PulledCard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const pullButtonRef = useRef<HTMLButtonElement>(null);
  const pull10ButtonRef = useRef<HTMLButtonElement>(null);

  const gachaCostSui = Number(GACHA_COST) / 1_000_000_000;
  const gachaCost10Sui = Number(GACHA_COST_10) / 1_000_000_000;

  const canPull1 = balance !== null && balance >= gachaCostSui;
  const canPull10 = balance !== null && balance >= gachaCost10Sui;
  const isLoading = isPulling || isPulling10;

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const animateCardsEntrance = useCallback((cardElements: HTMLElement[]) => {
    cardElements.forEach((card, index) => {
      gsap.set(card, {
        opacity: 0,
        scale: 0.5,
        y: 50,
      });

      gsap.to(card, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        delay: index * 0.1,
        ease: "back.out(1.7)",
      });
    });
  }, []);

  const handleCardClick = useCallback(
    (cardId: string, cardElement: HTMLElement) => {
      if (flippedCards.has(cardId)) return;

      gsap.to(cardElement, {
        rotateY: 180,
        duration: 0.6,
        ease: "power2.inOut",
      });

      setFlippedCards((prev) => new Set(prev).add(cardId));
    },
    [flippedCards]
  );

  const handlePull = useCallback(
    async (count: 1 | 10) => {
      try {
        setShowResults(false);
        setPulledCards([]);
        setFlippedCards(new Set());

        if (pullButtonRef.current && count === 1) {
          gsap.to(pullButtonRef.current, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
          });
        }
        if (pull10ButtonRef.current && count === 10) {
          gsap.to(pull10ButtonRef.current, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
          });
        }

        let result: { cardIds: string[] } | { cardId: string | null };

        if (count === 1) {
          result = await pull();
        } else {
          result = await pull10();
        }

        await refetchBalance();
        const updatedCards = await fetchCards();

        const cardIds =
          "cardIds" in result
            ? result.cardIds
            : result.cardId
              ? [result.cardId]
              : [];

        const newCards =
          updatedCards?.filter((card) => cardIds.includes(card.id.id)) ?? [];

        setPulledCards(newCards.map((card) => ({ ...card, isNew: true })));
        setShowResults(true);

        setTimeout(() => {
          if (cardsContainerRef.current) {
            const cardElements =
              cardsContainerRef.current.querySelectorAll("[data-card]");
            animateCardsEntrance(Array.from(cardElements) as HTMLElement[]);
          }
        }, 100);
      } catch (error) {
        console.error("Pull failed:", error);
      }
    },
    [pull, pull10, refetchBalance, fetchCards, animateCardsEntrance]
  );

  const handleCloseResults = useCallback(() => {
    if (cardsContainerRef.current) {
      const cardElements =
        cardsContainerRef.current.querySelectorAll("[data-card]");
      gsap.to(cardElements, {
        opacity: 0,
        scale: 0.8,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        onComplete: () => {
          setShowResults(false);
          setPulledCards([]);
          setFlippedCards(new Set());
        },
      });
    } else {
      setShowResults(false);
      setPulledCards([]);
      setFlippedCards(new Set());
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background via-background to-muted/20"
    >
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-god-of-war tracking-wider">
            Card Gacha
          </h1>
          <p className="text-muted-foreground">
            Pull cards to build your collection
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm pt-2">
            {[
              { rarity: Rarity.COMMON, rate: "67.5%" },
              { rarity: Rarity.RARE, rate: "20%" },
              { rarity: Rarity.EPIC, rate: "10%" },
              { rarity: Rarity.LEGENDARY, rate: "2%" },
              { rarity: Rarity.MYTHIC, rate: "0.5%" },
            ].map(({ rarity, rate }) => (
              <div
                key={rarity}
                className="flex items-center gap-2 px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${RarityColors[rarity]}15`,
                  border: `1px solid ${RarityColors[rarity]}40`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: RarityColors[rarity] }}
                />
                <span style={{ color: RarityColors[rarity] }}>
                  {RarityNames[rarity]}
                </span>
                <span className="text-muted-foreground">{rate}</span>
              </div>
            ))}
          </div>
        </div>

        {currentAccount ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold">
              {balance !== null ? `${balance.toFixed(4)} SUI` : "Loading..."}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              Connect wallet to pull cards
            </p>
          </div>
        )}

        {showResults && pulledCards.length > 0 ? (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted-foreground">
              Click on cards to reveal them
            </p>
            <div
              ref={cardsContainerRef}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center"
              style={{ perspective: "1000px" }}
            >
              {pulledCards.map((card) => {
                const isFlipped = flippedCards.has(card.id.id);
                return (
                  <div
                    key={card.id.id}
                    data-card
                    onClick={(e) =>
                      handleCardClick(card.id.id, e.currentTarget)
                    }
                    className="relative w-32 h-44 cursor-pointer"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Card Back - visible by default */}
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

                    {/* Card Front - hidden until flipped */}
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
              })}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleCloseResults}
                variant="outline"
                size="lg"
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              ref={pullButtonRef}
              onClick={() => handlePull(1)}
              disabled={!currentAccount || !canPull1 || isLoading}
              size="lg"
              className="w-48 h-14 text-lg relative overflow-hidden"
            >
              {isPulling ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Pull 1
                </>
              )}
              <span className="absolute bottom-1 text-xs opacity-70">
                {gachaCostSui} SUI
              </span>
            </Button>

            <Button
              ref={pull10ButtonRef}
              onClick={() => handlePull(10)}
              disabled={!currentAccount || !canPull10 || isLoading}
              size="lg"
              className="w-48 h-14 text-lg relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isPulling10 ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Pull 10
                </>
              )}
              <span className="absolute bottom-1 text-xs opacity-70">
                {gachaCost10Sui} SUI
              </span>
            </Button>
          </div>
        )}

        {!canPull1 && currentAccount && balance !== null && (
          <p className="text-center text-sm text-destructive">
            Insufficient balance for pull
          </p>
        )}

        {cards.length > 0 && (
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-bold mb-4 text-center">
              Your Collection ({cards.length} cards)
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {cards.map((card) => (
                <div
                  key={card.id.id}
                  className="relative w-full aspect-[2/3] rounded-lg overflow-hidden transition-transform hover:scale-105"
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
                  <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/90 to-transparent">
                    <p
                      className="text-[10px] font-bold text-center truncate"
                      style={{ color: RarityColors[card.rarity] }}
                    >
                      {RarityNames[card.rarity]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
