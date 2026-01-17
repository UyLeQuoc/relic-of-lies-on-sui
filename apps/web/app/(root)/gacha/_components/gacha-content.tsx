"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  GachaCard,
  PullButton,
  RarityRatesDisplay,
  BalanceDisplay,
  CardCarousel,
} from "@/components/gacha";
import { useGacha, useGachaAnimations } from "@/hooks/use-gacha";

export function GachaContent() {
  const {
    currentAccount,
    balance,
    pulledCards,
    showResults,
    isLoading,
    canPull1,
    canPull10,
    gachaCostSui,
    gachaCost10Sui,
    handlePull,
    handleCloseResults,
    flipCard,
    isCardFlipped,
    revealAllCards,
    allCardsRevealed,
  } = useGacha();

  const {
    containerRef,
    cardsContainerRef,
    pullButtonRef,
    pull10ButtonRef,
    animateCardFlip,
    animateButtonPress,
    animateCardsExit,
    triggerCardsEntrance,
    animateRevealAll,
  } = useGachaAnimations();

  const onPull = useCallback(
    async (count: 1 | 10) => {
      if (count === 1) {
        animateButtonPress(pullButtonRef);
      } else {
        animateButtonPress(pull10ButtonRef);
      }

      await handlePull(count);

      setTimeout(() => {
        triggerCardsEntrance();
      }, 100);
    },
    [
      handlePull,
      animateButtonPress,
      pullButtonRef,
      pull10ButtonRef,
      triggerCardsEntrance,
    ]
  );

  const onCardClick = useCallback(
    (cardId: string, element: HTMLElement) => {
      if (isCardFlipped(cardId)) return;
      animateCardFlip(element);
      flipCard(cardId);
    },
    [isCardFlipped, animateCardFlip, flipCard]
  );

  const onCloseResults = useCallback(() => {
    animateCardsExit(handleCloseResults);
  }, [animateCardsExit, handleCloseResults]);

  const onRevealAll = useCallback(() => {
    animateRevealAll();
    revealAllCards();
  }, [animateRevealAll, revealAllCards]);

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
          <RarityRatesDisplay />
        </div>

        <BalanceDisplay balance={balance} isConnected={!!currentAccount} />

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
              {pulledCards.map((card) => (
                <GachaCard
                  key={card.id.id}
                  card={card}
                  isFlipped={isCardFlipped(card.id.id)}
                  onClick={onCardClick}
                />
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                onClick={onRevealAll}
                variant="secondary"
                size="lg"
                className="px-8"
                disabled={allCardsRevealed}
              >
                Reveal All
              </Button>
              <Button
                onClick={onCloseResults}
                variant="outline"
                size="lg"
                className="px-8"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <CardCarousel />
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <PullButton
                ref={pullButtonRef}
                count={1}
                cost={gachaCostSui}
                disabled={!currentAccount || !canPull1 || isLoading}
                isLoading={isLoading}
                onClick={() => onPull(1)}
              />
              <PullButton
                ref={pull10ButtonRef}
                count={10}
                cost={gachaCost10Sui}
                disabled={!currentAccount || !canPull10 || isLoading}
                isLoading={isLoading}
                onClick={() => onPull(10)}
              />
            </div>
          </div>
        )}

        {!canPull1 && currentAccount && balance !== null && (
          <p className="text-center text-sm text-destructive">
            Insufficient balance for pull
          </p>
        )}
      </div>
    </div>
  );
}
