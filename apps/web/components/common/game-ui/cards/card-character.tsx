"use client";

import * as React from "react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { CardType, CardConceptValue } from "./types";
import { CardConceptType, cardsMap } from "./types";
import { cn } from "@/lib/utils";

const cardCharacterVariants = cva(
  "relative transition-transform duration-500 transform-style-preserve-3d",
  {
    variants: {
      size: {
        sm: "h-[200px]",
        md: "h-[280px]",
        default: "h-[384px]",
        lg: "h-[500px]",
      },
      flip: {
        false: "",
        true: "cursor-pointer",
      },
    },
    defaultVariants: {
      size: "default",
      flip: false,
    },
  }
);

interface CardCharacterProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardCharacterVariants> {
  cardType: CardType;
  cardConcept?: CardConceptValue;
}

function CardCharacter({
  cardType,
  cardConcept = cardsMap[CardConceptType.RelicOfLies],
  className,
  size = "default",
  flip = false,
  ...props
}: CardCharacterProps) {
  const card = cardConcept.cards[cardType];
  
  const heightMap = {
    sm: 200,
    md: 280,
    default: 384,
    lg: 500,
  } as const;
  
  const h = heightMap[size ?? "default"];
  const w = Math.round((h * 2) / 3);

  const [flipped, setFlipped] = useState(false);
  const canFlip = flip === true;
  const handleFlip = () => {
    setFlipped((f) => !f);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleFlip();
    }
  };

  const interactiveProps = canFlip
    ? {
        onClick: handleFlip,
        onKeyDown: handleKeyDown,
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  return (
    <div
      className={cn(
        cardCharacterVariants({ size, flip }),
        canFlip && flipped && "rotate-y-180",
        className
      )}
      style={{ width: w, height: h }}
      {...interactiveProps}
      {...props}
    >
      {/* Card Front */}
      <div className="absolute w-full h-full backface-hidden">
        {/* Character image at the bottom */}
        <img
          src={card.image}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-contain z-0"
        />

        {/* Frame on top of character */}
        <img
          src={cardConcept.frame}
          alt="Card Frame"
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
        />

        {/* Value, Name, Description with styles from constant and dynamic fontSize */}
        <span
          className={cn(
            cardConcept.valueStyle,
            card.valueStyle,
            "absolute z-20"
          )}
          style={{ fontSize: `${h * (cardConcept.valueFontSize ?? 0.1)}px` }}
        >
          {card.value}
        </span>
        <h3
          className={cn(
            cardConcept.nameStyle,
            card.nameStyle,
            "absolute z-20 truncate"
          )}
          style={{ fontSize: `${h * (cardConcept.nameFontSize ?? 0.048)}px` }}
        >
          {card.name}
        </h3>
        {card.description && (
          <p
            className={cn(
              cardConcept.descriptionStyle,
              card.descriptionStyle,
              "absolute z-20 text-center left-1/2 -translate-x-1/2"
            )}
            style={{
              fontSize: `${h * (cardConcept.descriptionFontSize ?? 0.028)}px`,
            }}
          >
            {card.description}
          </p>
        )}
      </div>

      {/* Card Back */}
      <div className="absolute w-full h-full backface-hidden rotate-y-180">
        <img
          src={cardConcept.cardBack}
          alt="Card Back"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export { CardCharacter, cardCharacterVariants };