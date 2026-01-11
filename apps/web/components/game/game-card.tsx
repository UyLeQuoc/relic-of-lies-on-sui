"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { CardCharacter } from "@/components/common/game-ui/cards/card-character";
import { CardType } from "@/components/common/game-ui/cards/types";
import { cn } from "@/lib/utils";
import type { GameCard } from "./game-context";

interface GameCardProps {
	card: GameCard;
	size?: "small" | "medium" | "large";
	faceUp?: boolean;
	selected?: boolean;
	onClick?: () => void;
	disabled?: boolean;
}

// Map old card types to new CardType enum
const mapCardTypeToNewType = (oldType: string): CardType => {
	const mapping: Record<string, CardType> = {
		spy: CardType.Value0,
		guard: CardType.Value1,
		priest: CardType.Value2,
		baron: CardType.Value3,
		handmaid: CardType.Value4,
		prince: CardType.Value5,
		chancellor: CardType.Value6,
		king: CardType.Value7,
		countess: CardType.Value8,
		princess: CardType.Value9,
	};
	return mapping[oldType] || CardType.Value0;
};

// Map size props to CardCharacter size
const mapSize = (
	size: "small" | "medium" | "large",
): "sm" | "md" | "default" | "lg" | "responsive" => {
	switch (size) {
		case "small":
			return "sm";
		case "medium":
			return "md";
		case "large":
			return "lg";
		default:
			return "default";
	}
};

export function GameCardComponent({
	card,
	size = "medium",
	faceUp = false,
	selected = false,
	onClick,
	disabled = false,
}: GameCardProps) {
	const newCardType = mapCardTypeToNewType(card.type);
	const cardSize = mapSize(size);

	// Use internal flip state to control card face
	const [isFlipped, setIsFlipped] = React.useState(!faceUp);

	React.useEffect(() => {
		setIsFlipped(!faceUp);
	}, [faceUp]);

	return (
		<motion.div
			whileHover={!disabled ? { scale: 1.05, y: -5 } : undefined}
			whileTap={!disabled ? { scale: 0.98 } : undefined}
			onClick={disabled ? undefined : onClick}
			className={cn(
				"relative rounded-lg shadow-xl transition-all duration-200",
				onClick && !disabled && "cursor-pointer",
				selected &&
					"ring-4 ring-gold dark:ring-silver ring-offset-2 ring-offset-cream dark:ring-offset-midnight",
				disabled && "opacity-50 cursor-not-allowed",
			)}
		>
			<div
				style={{
					transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
					transformStyle: "preserve-3d",
				}}
				className="transition-transform duration-500"
			>
				<CardCharacter cardType={newCardType} size={cardSize} flip={false} />
			</div>
		</motion.div>
	);
}
