"use client";

import { useCallback, useMemo, useState } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import {
  Rarity,
  type CardNFT,
  useGachaUpgrade,
} from "@/hooks/use-game-contract";

const REQUIRED_CARDS_FOR_UPGRADE = 3;

export interface UpgradeState {
  isUpgradeMode: boolean;
  selectedCards: CardNFT[];
  targetRarity: number | null;
  targetRole: number | null;
}

export interface UpgradeResult {
  success: boolean;
  newCard: CardNFT | null;
  digest: string | null;
}

export function useUpgrade(cards: CardNFT[]) {
  const client = useSuiClient();
  const { upgrade, isPending: isUpgrading } = useGachaUpgrade();
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);
  const [selectedCards, setSelectedCards] = useState<CardNFT[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<UpgradeResult | null>(
    null
  );

  const firstSelectedCard = selectedCards[0] ?? null;
  const secondSelectedCard = selectedCards[1] ?? null;
  const thirdSelectedCard = selectedCards[2] ?? null;

  const targetRarity = firstSelectedCard?.rarity ?? null;
  const targetRole = firstSelectedCard?.value ?? null;

  const canUpgrade = useMemo(() => {
    if (selectedCards.length !== REQUIRED_CARDS_FOR_UPGRADE) return false;
    if (targetRarity === Rarity.MYTHIC) return false;

    const firstCard = selectedCards[0];
    if (!firstCard) return false;

    return selectedCards.every(
      (card) =>
        card.rarity === firstCard.rarity && card.value === firstCard.value
    );
  }, [selectedCards, targetRarity]);

  const nextRarity = useMemo(() => {
    if (targetRarity === null) return null;
    if (targetRarity >= Rarity.MYTHIC) return null;
    return targetRarity + 1;
  }, [targetRarity]);

  const isCardSelectable = useCallback(
    (card: CardNFT): boolean => {
      if (!isUpgradeMode) return false;

      if (card.rarity === Rarity.MYTHIC) return false;

      if (selectedCards.length === 0) return true;

      if (selectedCards.some((c) => c.id.id === card.id.id)) return false;

      if (selectedCards.length >= REQUIRED_CARDS_FOR_UPGRADE) return false;

      return card.rarity === targetRarity && card.value === targetRole;
    },
    [isUpgradeMode, selectedCards, targetRarity, targetRole]
  );

  const isCardSelected = useCallback(
    (card: CardNFT): boolean => {
      return selectedCards.some((c) => c.id.id === card.id.id);
    },
    [selectedCards]
  );

  const selectCard = useCallback(
    (card: CardNFT) => {
      if (!isUpgradeMode) return;

      if (isCardSelected(card)) {
        setSelectedCards((prev) => prev.filter((c) => c.id.id !== card.id.id));
        return;
      }

      if (!isCardSelectable(card)) return;

      if (selectedCards.length >= REQUIRED_CARDS_FOR_UPGRADE) return;

      setSelectedCards((prev) => [...prev, card]);
    },
    [isUpgradeMode, isCardSelected, isCardSelectable, selectedCards.length]
  );

  const enterUpgradeMode = useCallback(() => {
    setIsUpgradeMode(true);
    setSelectedCards([]);
  }, []);

  const exitUpgradeMode = useCallback(() => {
    setIsUpgradeMode(false);
    setSelectedCards([]);
    setUpgradeResult(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  const performUpgrade =
    useCallback(async (): Promise<UpgradeResult | null> => {
      if (!canUpgrade || selectedCards.length !== 3) return null;

      const card1 = selectedCards[0];
      const card2 = selectedCards[1];
      const card3 = selectedCards[2];

      if (!card1 || !card2 || !card3) return null;

      try {
        setIsAnimating(true);

        // Call the smart contract
        const result = await upgrade(card1.id.id, card2.id.id, card3.id.id);

        // Fetch the new card data if we got a card ID
        let newCard: CardNFT | null = null;
        if (result.cardId) {
          const cardObject = await client.getObject({
            id: result.cardId,
            options: { showContent: true },
          });

          if (
            cardObject.data?.content?.dataType === "moveObject" &&
            cardObject.data.objectId
          ) {
            const fields = cardObject.data.content.fields as Record<
              string,
              unknown
            >;
            newCard = {
              id: { id: cardObject.data.objectId },
              value: Number(fields.value),
              rarity: Number(fields.rarity),
              wins: BigInt((fields.wins as string) || "0"),
              games_played: BigInt((fields.games_played as string) || "0"),
            };
          }
        }

        // Determine if upgrade was successful (new rarity is higher than original)
        const originalRarity = card1.rarity;
        const success = newCard !== null && newCard.rarity > originalRarity;

        const upgradeResult: UpgradeResult = {
          success,
          newCard,
          digest: result.digest,
        };

        setUpgradeResult(upgradeResult);
        return upgradeResult;
      } catch (error) {
        console.error("Upgrade failed:", error);
        setIsAnimating(false);
        return null;
      }
    }, [canUpgrade, selectedCards, upgrade, client]);

  const onAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setSelectedCards([]);
    setUpgradeResult(null);
  }, []);

  const selectableCardsCount = useMemo(() => {
    if (!isUpgradeMode || selectedCards.length === 0) return 0;
    return cards.filter(
      (card) =>
        card.rarity === targetRarity &&
        card.value === targetRole &&
        !selectedCards.some((c) => c.id.id === card.id.id)
    ).length;
  }, [cards, isUpgradeMode, selectedCards, targetRarity, targetRole]);

  const selectedCount = selectedCards.length;
  const remainingCount = REQUIRED_CARDS_FOR_UPGRADE - selectedCount;

  return {
    isUpgradeMode,
    selectedCards,
    firstSelectedCard,
    secondSelectedCard,
    thirdSelectedCard,
    targetRarity,
    targetRole,
    nextRarity,
    canUpgrade,
    selectableCardsCount,
    selectedCount,
    remainingCount,
    isCardSelectable,
    isCardSelected,
    selectCard,
    enterUpgradeMode,
    exitUpgradeMode,
    clearSelection,
    performUpgrade,
    isUpgrading,
    isAnimating,
    setIsAnimating,
    upgradeResult,
    onAnimationComplete,
  };
}
