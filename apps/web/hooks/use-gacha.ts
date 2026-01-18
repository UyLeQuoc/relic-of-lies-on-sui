"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useBalance } from "@/contexts/balance-context";
import {
  useGachaPull,
  useGetMyCards,
  GACHA_COST,
  type CardNFT,
} from "@/hooks/use-game-contract";
import { mistToSui } from "@/lib/gacha";
import gsap from "gsap";

export interface PulledCard extends CardNFT {
  isNew?: boolean;
}

export function useGacha() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { balance, refetch: refetchBalance } = useBalance();
  const { pull, isPending: isPulling } = useGachaPull();
  const { cards, fetchCards } = useGetMyCards();

  const [pulledCards, setPulledCards] = useState<PulledCard[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const gachaCostSui = mistToSui(GACHA_COST);
  const gachaCost10Sui = gachaCostSui * 10;

  const canPull1 = balance !== null && balance >= gachaCostSui;
  const canPull10 = balance !== null && balance >= gachaCost10Sui;
  const isLoading = isPulling || isLoadingCards;

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handlePull = useCallback(
    async (count: 1 | 10) => {
      try {
        setShowResults(false);
        setPulledCards([]);
        setFlippedCards(new Set());
        setIsLoadingCards(true);

        const result = await pull(count);

        await refetchBalance();

        const cardIds = result.cardIds;

        if (cardIds.length === 0) {
          setShowResults(true);
          setIsLoadingCards(false);
          return [];
        }

        const cardObjects = await client.multiGetObjects({
          ids: cardIds,
          options: {
            showContent: true,
          },
        });

        const newCards: PulledCard[] = [];
        for (const obj of cardObjects) {
          if (obj.data?.content?.dataType === "moveObject") {
            const fields = obj.data.content.fields as Record<string, unknown>;
            newCards.push({
              id: { id: obj.data.objectId },
              value: Number(fields.value),
              rarity: Number(fields.rarity),
              wins: BigInt((fields.wins as string) || "0"),
              games_played: BigInt((fields.games_played as string) || "0"),
              isNew: true,
            });
          }
        }

        setPulledCards(newCards);
        setShowResults(true);
        setIsLoadingCards(false);

        fetchCards();

        return newCards;
      } catch (error) {
        console.error("Pull failed:", error);
        setIsLoadingCards(false);
        throw error;
      }
    },
    [client, pull, refetchBalance, fetchCards]
  );

  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    setPulledCards([]);
    setFlippedCards(new Set());
  }, []);

  const flipCard = useCallback(
    (cardId: string) => {
      if (flippedCards.has(cardId)) return;
      setFlippedCards((prev) => new Set(prev).add(cardId));
    },
    [flippedCards]
  );

  const isCardFlipped = useCallback(
    (cardId: string) => flippedCards.has(cardId),
    [flippedCards]
  );

  const revealAllCards = useCallback(() => {
    const allCardIds = pulledCards.map((card) => card.id.id);
    setFlippedCards(new Set(allCardIds));
  }, [pulledCards]);

  const allCardsRevealed =
    pulledCards.length > 0 && flippedCards.size >= pulledCards.length;

  return {
    currentAccount,
    balance,
    cards,
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
  };
}

export function useGachaAnimations() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const pullButtonRef = useRef<HTMLButtonElement>(null);
  const pull10ButtonRef = useRef<HTMLButtonElement>(null);

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

  const animateCardFlip = useCallback((cardElement: HTMLElement) => {
    gsap.to(cardElement, {
      rotateY: 180,
      duration: 0.6,
      ease: "power2.inOut",
    });
  }, []);

  const animateButtonPress = useCallback(
    (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
      if (buttonRef.current) {
        gsap.to(buttonRef.current, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1,
        });
      }
    },
    []
  );

  const animateCardsExit = useCallback((onComplete: () => void) => {
    if (cardsContainerRef.current) {
      const cardElements =
        cardsContainerRef.current.querySelectorAll("[data-card]");
      gsap.to(cardElements, {
        opacity: 0,
        scale: 0.8,
        y: -20,
        duration: 0.3,
        stagger: 0.05,
        onComplete,
      });
    } else {
      onComplete();
    }
  }, []);

  const triggerCardsEntrance = useCallback(() => {
    if (cardsContainerRef.current) {
      const cardElements =
        cardsContainerRef.current.querySelectorAll("[data-card]");
      animateCardsEntrance(Array.from(cardElements) as HTMLElement[]);
    }
  }, [animateCardsEntrance]);

  const animateRevealAll = useCallback(() => {
    if (cardsContainerRef.current) {
      const cardElements =
        cardsContainerRef.current.querySelectorAll("[data-card]");
      cardElements.forEach((card, index) => {
        gsap.to(card, {
          rotateY: 180,
          duration: 0.6,
          delay: index * 0.08,
          ease: "power2.inOut",
        });
      });
    }
  }, []);

  return {
    containerRef,
    cardsContainerRef,
    pullButtonRef,
    pull10ButtonRef,
    animateCardsEntrance,
    animateCardFlip,
    animateButtonPress,
    animateCardsExit,
    triggerCardsEntrance,
    animateRevealAll,
  };
}
