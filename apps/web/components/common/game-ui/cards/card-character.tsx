"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useRef, useState } from "react";
import type { CardConceptValue, CardType } from "./types";
import { CardConceptType, cardsMap } from "./types";
import type * as React from "react";

const cardCharacterVariants = cva(
  "relative transition-transform duration-500",
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const canFlip = flip === true;
  const handleFlip = () => {
    setFlipped((f) => !f);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const interactiveProps = canFlip
    ? {
        onClick: handleFlip,
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  // Character image parallax transform
  const imageTransform = isHovered
    ? `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
    : "translate(0, 0)";

  return (
    <div
      ref={cardRef}
      className={cn(
        cardCharacterVariants({ size, flip }),
        "group",
        className
      )}
      style={{
        width: w,
        height: h,
        transformStyle: "preserve-3d",
        transform: canFlip && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...interactiveProps}
      {...props}
    >
      {/* Card Front */}
      <div
        className="absolute w-full h-full overflow-hidden"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* Character image at the bottom */}
        <img
          src={card.image}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-contain z-0 transition-transform duration-300 ease-out"
          style={{
            transform: imageTransform,
          }}
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
      <div
        className="absolute w-full h-full"
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
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
