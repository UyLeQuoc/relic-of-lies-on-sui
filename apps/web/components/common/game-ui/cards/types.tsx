export enum CardConceptType {
	RelicOfLies = "RelicOfLies",
}

export enum CardType {
	Value0 = "Value0",
	Value1 = "Value1",
	Value2 = "Value2",
	Value3 = "Value3",
	Value4 = "Value4",
	Value5 = "Value5",
	Value6 = "Value6",
	Value7 = "Value7",
	Value8 = "Value8",
	Value9 = "Value9",
}

export const cardTypes = [
	CardType.Value0, // Scout
	CardType.Value1, // Knight
	CardType.Value2, // Healer
	CardType.Value3, // Berserker
	CardType.Value4, // Cleric Ward
	CardType.Value5, // Wizard
	CardType.Value6, // Tactician
	CardType.Value7, // Paladin
	CardType.Value8, // Cursed Idol
	CardType.Value9, // Sacred Crystal
];

export interface CardConceptValue {
	name: string;
	description: string;
	frame: string;
	cardBack: string;
	valueFontSize: number;
	nameFontSize: number;
	descriptionFontSize: number;
	valueStyle: string;
	nameStyle: string;
	descriptionStyle: string;
	cards: Record<CardType, CardValue>;
}

export interface CardValue {
	value: number;
	name: string;
	description: string;
	image: string;
	valueStyle?: string;
	nameStyle?: string;
	descriptionStyle?: string;
}

const imagePrefixPath = "/images/cards";

export const cardsMap: Record<CardConceptType, CardConceptValue> = {
	[CardConceptType.RelicOfLies]: {
		name: "Relic of Lies",
		description: "A dark dungeon with a lot of things",
		frame: `${imagePrefixPath}/frames/card-frame.png`,
		cardBack: `${imagePrefixPath}/frames/card-back.png`,

		valueFontSize: 0.1,
		nameFontSize: 0.048,
		descriptionFontSize: 0.028,

		valueStyle:
			"text-[#d2ac77] top-[1.8%] left-[10.5%] drop-shadow-lg font-(family-name:--font-faith-collapsing)",
		nameStyle:
			"text-[#402716] top-[3.3%] left-3/5 -translate-x-1/2 Z font-(family-name:--font-god-of-war) max-w-[70%]",
		descriptionStyle:
			"text-black/80 bottom-[10%] font-(family-name:--font-helvetica) w-[72%] font-semibold",

		cards: {
			[CardType.Value0]: {
				value: 0,
				name: "Scout",
				description:
					"At round end, if only you played or discarded a Scout, gain 1 Relic.",
				image: `${imagePrefixPath}/characters/0.png`,
			},
			[CardType.Value1]: {
				value: 1,
				name: "Knight",
				description:
					"Name a card non-Knight. If that target holds it, they are eliminated.",
				image: `${imagePrefixPath}/characters/1.png`,
				valueStyle: "left-[11.5%]",
			},
			[CardType.Value2]: {
				value: 2,
				name: "Healer",
				description: "Choose and privately look at another player's hand.",
				image: `${imagePrefixPath}/characters/2.png`,
				valueStyle: "top-[1.6%]",
				descriptionStyle: "w-[68%]",
			},
			[CardType.Value3]: {
				value: 3,
				name: "Berserker",
				description:
					"Compare hands with another player. Lower card is eliminated.",
				image: `${imagePrefixPath}/characters/3.png`,
				valueStyle: "top-[2.2%]",
			},
			[CardType.Value4]: {
				value: 4,
				name: "Cleric",
				description: "You are immune to all card effects until your next turn.",
				image: `${imagePrefixPath}/characters/4.png`,
				descriptionStyle: "w-[60%]",
				valueStyle: "left-[9.8%]",
			},
			[CardType.Value5]: {
				value: 5,
				name: "Wizard",
				description:
					"Choose any player. They discard their card and draw a new one.",
				image: `${imagePrefixPath}/characters/5.png`,
				valueStyle: "left-[10.3%]",
			},
			[CardType.Value6]: {
				value: 6,
				name: "Tactician",
				description:
					"Draw 2 cards. Keep one and place the others at bottom in any order",
				image: `${imagePrefixPath}/characters/6.png`,
				valueStyle: "left-[10%]",
			},
			[CardType.Value7]: {
				value: 7,
				name: "Paladin",
				description: "Choose and swap your hand with another player's hand.",
				image: `${imagePrefixPath}/characters/7.png`,
				descriptionStyle: "w-[60%]",
				valueStyle: "top-[2.5%]",
			},
			[CardType.Value8]: {
				value: 8,
				name: "Cursed Idol",
				description:
					"Must be discarded if held with Wizard or Paladin. Otherwise, no effect.",
				image: `${imagePrefixPath}/characters/8.png`,
			},
			[CardType.Value9]: {
				value: 9,
				name: "Sacred Crystal",
				description:
					"If you play or discard this card, you are immediately eliminated.",
				image: `${imagePrefixPath}/characters/9.png`,
				valueStyle: "top-[1.6%]",
			},
		},
	},
};
