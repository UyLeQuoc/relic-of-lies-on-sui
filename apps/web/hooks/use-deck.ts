"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import type { CardNFT } from "@/hooks/use-game-contract-v4";

const DECK_STORAGE_KEY = "relic-of-lies-deck";

export interface DeckSelection {
  [role: number]: string; // role -> cardId
}

export function useDeck() {
  const currentAccount = useCurrentAccount();
  const [deckSelection, setDeckSelection] = useState<DeckSelection>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentAccount) {
      loadDeck();
    } else {
      setDeckSelection({});
      setIsLoading(false);
    }
  }, [currentAccount]);

  const loadDeck = useCallback(() => {
    if (!currentAccount) {
      setIsLoading(false);
      return;
    }
    try {
      const stored = localStorage.getItem(
        `${DECK_STORAGE_KEY}-${currentAccount.address}`
      );
      if (stored) {
        const parsed = JSON.parse(stored) as DeckSelection;
        setDeckSelection(parsed);
      } else {
        setDeckSelection({});
      }
    } catch (error) {
      console.error("Failed to load deck:", error);
      setDeckSelection({});
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount]);

  const saveDeck = useCallback(
    (selection: DeckSelection) => {
      if (!currentAccount) return;
      try {
        localStorage.setItem(
          `${DECK_STORAGE_KEY}-${currentAccount.address}`,
          JSON.stringify(selection)
        );
        setDeckSelection(selection);
        return true;
      } catch (error) {
        console.error("Failed to save deck:", error);
        return false;
      }
    },
    [currentAccount]
  );

  const getDeckCards = useCallback(
    (cards: CardNFT[]): Record<number, CardNFT | null> => {
      const deckCards: Record<number, CardNFT | null> = {};
      Object.entries(deckSelection).forEach(([role, cardId]) => {
        const roleNum = Number(role);
        deckCards[roleNum] =
          cards.find((card) => card.id.id === cardId) || null;
      });
      return deckCards;
    },
    [deckSelection]
  );

  const getCardForRole = useCallback(
    (role: number, cards: CardNFT[]): CardNFT | null => {
      const cardId = deckSelection[role];
      if (!cardId) return null;
      return cards.find((card) => card.id.id === cardId) || null;
    },
    [deckSelection]
  );

  return {
    deckSelection,
    isLoading,
    loadDeck,
    saveDeck,
    getDeckCards,
    getCardForRole,
  };
}
