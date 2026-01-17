"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CardNames, Rarity } from "@/hooks/use-game-contract";
import { RarityColors, RarityGlow, RarityNames } from "@/lib/gacha";
import gsap from "gsap";

const CARD_COUNT = 10;
const PAUSE_DURATION = 2000;

interface CarouselCard {
  id: number;
  value: number;
  rarity: number;
}

let cardIdCounter = 0;

function getRandomRarity(): number {
  const roll = Math.random() * 100;
  if (roll < 0.5) return Rarity.MYTHIC;
  if (roll < 2.5) return Rarity.LEGENDARY;
  if (roll < 12.5) return Rarity.EPIC;
  if (roll < 32.5) return Rarity.RARE;
  return Rarity.COMMON;
}

function getRandomCard(excludeValues: number[] = []): CarouselCard {
  let value = Math.floor(Math.random() * CARD_COUNT);
  while (excludeValues.includes(value)) {
    value = Math.floor(Math.random() * CARD_COUNT);
  }
  return {
    id: cardIdCounter++,
    value,
    rarity: getRandomRarity(),
  };
}

function getInitialCards(): CarouselCard[] {
  const cards: CarouselCard[] = [];
  const usedValues: number[] = [];
  for (let i = 0; i < 5; i++) {
    const card = getRandomCard(usedValues);
    cards.push(card);
    usedValues.push(card.value);
  }
  return cards;
}

export function CardCarousel() {
  const [cards, setCards] = useState<CarouselCard[]>(() => getInitialCards());
  const containerRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimatingRef = useRef(false);

  const applyCardStyles = useCallback(() => {
    cardElementsRef.current.forEach((el, index) => {
      if (!el) return;
      const isCenter = index === 2;
      const isAdjacent = index === 1 || index === 3;

      gsap.set(el, {
        x: 0,
        scale: isCenter ? 1.15 : isAdjacent ? 0.9 : 0.75,
        opacity: isCenter ? 1 : isAdjacent ? 0.6 : 0.3,
        filter: isCenter ? "blur(0px)" : isAdjacent ? "blur(1px)" : "blur(2px)",
        zIndex: isCenter ? 10 : isAdjacent ? 5 : 1,
      });
    });
  }, []);

  const animateToNext = useCallback(() => {
    if (isAnimatingRef.current || !containerRef.current) return;
    isAnimatingRef.current = true;

    const cardWidth = 140;
    const gap = 16;
    const moveDistance = cardWidth + gap;

    const tl = gsap.timeline({
      onComplete: () => {
        setCards((prev) => {
          const usedValues = prev.slice(1).map((c) => c.value);
          const newCard = getRandomCard(usedValues);
          return [...prev.slice(1), newCard];
        });
        isAnimatingRef.current = false;
      },
    });

    cardElementsRef.current.forEach((el, index) => {
      if (!el) return;

      const newIndex = index - 1;
      const isNewCenter = newIndex === 2;
      const isNewAdjacent = newIndex === 1 || newIndex === 3;

      tl.to(
        el,
        {
          x: -moveDistance,
          scale: isNewCenter ? 1.15 : isNewAdjacent ? 0.9 : 0.75,
          opacity:
            newIndex < 0 ? 0 : isNewCenter ? 1 : isNewAdjacent ? 0.6 : 0.3,
          filter: isNewCenter
            ? "blur(0px)"
            : isNewAdjacent
              ? "blur(1px)"
              : "blur(2px)",
          zIndex: isNewCenter ? 10 : isNewAdjacent ? 5 : 1,
          duration: 0.8,
          ease: "power2.inOut",
        },
        0
      );
    });
  }, []);

  useEffect(() => {
    applyCardStyles();
  }, [cards, applyCardStyles]);

  useEffect(() => {
    const interval = setInterval(() => {
      animateToNext();
    }, PAUSE_DURATION);

    return () => clearInterval(interval);
  }, [animateToNext]);

  return (
    <div className="relative w-full overflow-hidden py-8">
      <div
        ref={containerRef}
        className="flex items-center justify-center gap-4"
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            ref={(el) => {
              cardElementsRef.current[index] = el;
            }}
            className="relative shrink-0"
          >
            <div
              className="relative w-28 h-40 sm:w-32 sm:h-44 md:w-36 md:h-52 rounded-lg overflow-hidden transition-shadow duration-300"
              style={{
                backgroundColor: "#1a1a2e",
                border: `2px solid ${RarityColors[card.rarity]}`,
                boxShadow:
                  index === 2
                    ? RarityGlow[card.rarity]
                    : "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={`/images/cards/characters/${card.value}.png`}
                alt={CardNames[card.value]}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                <p
                  className="text-[10px] sm:text-xs font-bold text-center"
                  style={{ color: RarityColors[card.rarity] }}
                >
                  {RarityNames[card.rarity]}
                </p>
                <p className="text-xs sm:text-sm font-bold text-center text-white">
                  {CardNames[card.value]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
