"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { CardConceptValue, CardType } from "./types";
import { CardConceptType, cardsMap } from "./types";

const cardCharacterVariants = cva(
	"relative will-change-transform",
	{
		variants: {
			size: {
				xs: "h-[140px]",
				sm: "h-[200px]",
				md: "h-[280px]",
				default: "h-[250px] sm:h-[300px] md:h-[350px] lg:h-[384px]",
				lg: "h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px]",
				responsive:
					"h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] xl:h-[384px]",
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
	},
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
	// Base height for font size calculations (using default desktop size for calculations)
	const heightMap = {
		xs: 180,
		sm: 200,
		md: 280,
		default: 384,
		lg: 500,
		responsive: 350, // Base for calculations on responsive
	} as const;

	const baseHeight = heightMap[size ?? "default"];
	const isResponsive = size === "responsive";

	// Calculate dimensions for non-responsive sizes
	const h = isResponsive ? undefined : baseHeight;
	const w = isResponsive ? undefined : Math.round((baseHeight * 2) / 3);

	const [flipped, setFlipped] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const rafRef = useRef<number | null>(null);

	const canFlip = flip === true;
	const handleFlip = () => {
		setFlipped((f) => !f);
	};

	// Use RAF for smooth parallax - directly manipulate DOM instead of state
	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current || !imageRef.current) return;
		
		// Cancel any pending animation frame
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
		}
		
		rafRef.current = requestAnimationFrame(() => {
			if (!cardRef.current || !imageRef.current) return;
			const rect = cardRef.current.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
			const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
			imageRef.current.style.transform = `translate(${x * 3}px, ${y * 3}px)`;
		});
	}, []);

	const handleMouseLeave = useCallback(() => {
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
		}
		if (imageRef.current) {
			imageRef.current.style.transform = 'translate(0, 0)';
		}
	}, []);
	
	const card = cardConcept.cards[cardType];
	
	// Safety check: if card doesn't exist, use fallback
	if (!card) {
		console.warn(`Card type ${cardType} not found in cardConcept`);
		// Return early after hooks
		return null;
	}

	const interactiveProps = canFlip
		? {
				onClick: handleFlip,
				role: "button" as const,
				tabIndex: 0,
			}
		: {};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: no-mistake
		<div
			ref={cardRef}
			className={cn(
				cardCharacterVariants({ size, flip }),
				"group",
				isResponsive &&
					"aspect-[2/3] w-full max-w-[256px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[384px]",
				className,
			)}
			style={{
				...(isResponsive
					? {
							transformStyle: "preserve-3d",
							transform:
								canFlip && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
							transition: "transform 0.5s ease-out",
						}
					: {
							width: w,
							height: h,
							transformStyle: "preserve-3d",
							transform:
								canFlip && flipped ? "rotateY(180deg)" : "rotateY(0deg)",
							transition: "transform 0.5s ease-out",
						}),
			}}
			onMouseMove={handleMouseMove}
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
				{/* Character image at the bottom - with GPU-accelerated parallax */}
				<img
					ref={imageRef}
					src={card.image}
					alt={card.name}
					className="absolute inset-0 w-full h-full object-contain z-0 will-change-transform"
					style={{
						transform: "translate(0, 0)",
						transition: "transform 0.15s ease-out",
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
						"absolute z-20",
						isResponsive &&
							"text-[0.625rem] sm:text-[0.75rem] md:text-[0.875rem] lg:text-[1rem]",
					)}
					style={
						isResponsive
							? undefined
							: {
									fontSize: `${baseHeight * (cardConcept.valueFontSize ?? 0.1)}px`,
								}
					}
				>
					{card.value}
				</span>
				<h3
					className={cn(
						cardConcept.nameStyle,
						card.nameStyle,
						"absolute z-20 truncate",
						isResponsive &&
							"text-[0.5rem] sm:text-[0.625rem] md:text-[0.75rem] lg:text-[0.875rem]",
					)}
					style={
						isResponsive
							? undefined
							: {
									fontSize: `${baseHeight * (cardConcept.nameFontSize ?? 0.048)}px`,
								}
					}
				>
					{card.name}
				</h3>
				{card.description && (
					<p
						className={cn(
							cardConcept.descriptionStyle,
							card.descriptionStyle,
							"absolute z-20 text-center left-1/2 -translate-x-1/2",
							isResponsive &&
								"text-[0.4375rem] sm:text-[0.5rem] md:text-[0.5625rem] lg:text-[0.625rem]",
						)}
						style={
							isResponsive
								? undefined
								: {
										fontSize: `${baseHeight * (cardConcept.descriptionFontSize ?? 0.028)}px`,
									}
						}
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
