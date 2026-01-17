import { Rarity } from "@/hooks/use-game-contract";

export const RarityColors: Record<number, string> = {
  [Rarity.COMMON]: "#ffffff",
  [Rarity.RARE]: "#3b82f6",
  [Rarity.EPIC]: "#a855f7",
  [Rarity.LEGENDARY]: "#f97316",
  [Rarity.MYTHIC]: "#ef4444",
};

export const RarityNames: Record<number, string> = {
  [Rarity.COMMON]: "Common",
  [Rarity.RARE]: "Rare",
  [Rarity.EPIC]: "Epic",
  [Rarity.LEGENDARY]: "Legendary",
  [Rarity.MYTHIC]: "Mythic",
};

export const RarityGlow: Record<number, string> = {
  [Rarity.COMMON]: "0 0 20px rgba(255,255,255,0.3)",
  [Rarity.RARE]: "0 0 30px rgba(59,130,246,0.5)",
  [Rarity.EPIC]: "0 0 40px rgba(168,85,247,0.6)",
  [Rarity.LEGENDARY]: "0 0 50px rgba(249,115,22,0.7)",
  [Rarity.MYTHIC]: "0 0 60px rgba(239,68,68,0.8)",
};

export const RARITY_RATES = [
  { rarity: Rarity.COMMON, rate: "67.5%" },
  { rarity: Rarity.RARE, rate: "20%" },
  { rarity: Rarity.EPIC, rate: "10%" },
  { rarity: Rarity.LEGENDARY, rate: "2%" },
  { rarity: Rarity.MYTHIC, rate: "0.5%" },
] as const;

export const MIST_PER_SUI = 1_000_000_000;

export function mistToSui(mist: bigint | number): number {
  return Number(mist) / MIST_PER_SUI;
}
