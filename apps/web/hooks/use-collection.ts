"use client";

import { useCallback, useState } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import type { CardNFT } from "@/hooks/use-game-contract-v4";

export function useCollection() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const {
    variables: { movePackageIdV4 },
  } = useNetworkConfig();

  const [cards, setCards] = useState<CardNFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const parseCardFromObject = (obj: unknown): CardNFT | null => {
    const data = (obj as { data?: unknown })?.data as {
      objectId?: string;
      content?: { dataType?: string; fields?: Record<string, unknown> };
    } | null;

    if (
      data?.objectId &&
      data?.content?.dataType === "moveObject" &&
      data.content.fields
    ) {
      const fields = data.content.fields;
      return {
        id: { id: data.objectId },
        value: Number(fields.value),
        rarity: Number(fields.rarity),
        wins: BigInt((fields.wins as string) || "0"),
        games_played: BigInt((fields.games_played as string) || "0"),
      };
    }
    return null;
  };

  const fetchCards = useCallback(async () => {
    if (!currentAccount) {
      setCards([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const allCards: CardNFT[] = [];
      let cursor: string | null | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const response = await client.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${movePackageIdV4}::gacha::Card`,
          },
          options: {
            showContent: true,
            showType: true,
          },
          limit: 50,
          cursor: cursor ?? undefined,
        });

        for (const obj of response.data) {
          const card = parseCardFromObject(obj);
          if (card) {
            allCards.push(card);
          }
        }

        hasMore = response.hasNextPage;
        cursor = response.nextCursor;
      }

      setCards(allCards);
      return allCards;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch cards");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, currentAccount, movePackageIdV4]);

  const refresh = useCallback(async () => {
    setCards([]);
    return fetchCards();
  }, [fetchCards]);

  return {
    cards,
    isLoading,
    error,
    fetchCards,
    refresh,
  };
}
