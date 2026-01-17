"use client";

import { RarityColors, RarityNames, RARITY_RATES } from "@/lib/gacha";

interface RarityBadgeProps {
  rarity: number;
  rate: string;
}

export function RarityBadge({ rarity, rate }: RarityBadgeProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1 rounded-full"
      style={{
        backgroundColor: `${RarityColors[rarity]}15`,
        border: `1px solid ${RarityColors[rarity]}40`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: RarityColors[rarity] }}
      />
      <span style={{ color: RarityColors[rarity] }}>{RarityNames[rarity]}</span>
      <span className="text-muted-foreground">{rate}</span>
    </div>
  );
}

export function RarityRatesDisplay() {
  return (
    <div className="flex flex-wrap justify-center gap-3 text-sm pt-2">
      {RARITY_RATES.map(({ rarity, rate }) => (
        <RarityBadge key={rarity} rarity={rarity} rate={rate} />
      ))}
    </div>
  );
}
