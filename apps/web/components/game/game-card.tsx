"use client";

import * as React from "react";
import { CardCharacter } from "@/components/common/game-ui/cards/card-character";
import { CardType } from "@/components/common/game-ui/cards/types";
import { cn } from "@/lib/utils";
import type { GameCard } from "./game-context";

interface GameCardProps {
	card: GameCard;
	size?: "small" | "medium" | "large" | "tiny";
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
	size: "small" | "medium" | "large" | "tiny",
): "xs" | "sm" | "md" | "default" | "lg" | "responsive" => {
	switch (size) {
		case "tiny":
			return "xs";
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
		<div
			onClick={disabled ? undefined : onClick}
			className={cn(
				"relative rounded-lg shadow-xl will-change-transform",
				// Smooth hover animation using CSS
				"transition-transform duration-200 ease-out",
				onClick && !disabled && "cursor-pointer hover:scale-105 hover:-translate-y-1 active:scale-[0.98]",
				selected &&
					"ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-105 -translate-y-2",
				disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0",
			)}
		>
			<div
				style={{
					transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
					transformStyle: "preserve-3d",
				}}
				className="transition-transform duration-500 ease-out"
			>
				<CardCharacter cardType={newCardType} size={cardSize} flip={false} />
			</div>
		</div>
	);
}
