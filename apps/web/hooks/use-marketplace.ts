"use client";

import { useCallback, useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import type { CardNFT } from "@/hooks/use-game-contract-v4";

export interface MarketplaceListing {
  card: CardNFT;
  kioskId: string;
  price: bigint;
  seller: string;
}

export function useMarketplace() {
  const client = useSuiClient();
  const {
    variables: { movePackageIdV4, marketplaceIdV4 },
  } = useNetworkConfig();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transferPolicyId, setTransferPolicyId] = useState<string | null>(
    null
  );

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

  const fetchTransferPolicy = useCallback(async () => {
    try {
      const cardType = `${movePackageIdV4}::gacha::Card`;
      const policyType = `0x2::transfer_policy::TransferPolicy<${cardType}>`;

      const sharedResponse = await client.getObject({
        id: policyType,
        options: {
          showBcs: true,
        },
      });

      if (sharedResponse.data?.bcs?.dataType === "moveObject") {
        const policyId = sharedResponse.data.objectId || null;
        setTransferPolicyId(policyId);
        return policyId;
      }

      return null;
    } catch (err) {
      console.error("Failed to fetch transfer policy:", err);
      return null;
    }
  }, [client, movePackageIdV4]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const policyId = await fetchTransferPolicy();
      if (!policyId) {
        console.warn("Transfer policy not found, purchases may fail");
      }

      const allListings: MarketplaceListing[] = [];

      const cardType = `${movePackageIdV4}::gacha::Card`;
      const listingKeyType = `0x2::kiosk::Listing<${cardType}>`;

      let cursor: string | null | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const kioskCaps = await client.getOwnedObjects({
          owner: policyId as string,
          options: {
            showBcs: true,
          },
          limit: 50,
          cursor: cursor ?? undefined,
        });

        for (const capObj of kioskCaps.data) {
          if (
            capObj.data?.bcs?.dataType === "moveObject" &&
            capObj.data.bcs.type === "0x2::kiosk::KioskOwnerCap"
          ) {
            const kioskId = (capObj.data.owner as { AddressOwner: string }).AddressOwner;
            const owner = capObj.data.owner;

            if (owner && typeof owner === "object" && "AddressOwner" in owner) {
              const seller = owner.AddressOwner as string;

              try {
                let dfCursor: string | null | undefined = undefined;
                let dfHasMore = true;

                while (dfHasMore) {
                  const dynamicFields = await client.getDynamicFields({
                    parentId: kioskId,
                    cursor: dfCursor ?? undefined,
                  });

                  for (const field of dynamicFields.data) {
                    const fieldName = field.name as {
                      type?: string;
                      value?: unknown;
                    };

                    if (fieldName.type === listingKeyType) {
                      try {
                        const listingObj = await client.getObject({
                          id: field.objectId,
                          options: {
                            showBcs: true,
                            showType: true,
                          },
                        });

                        if (
                          listingObj.data?.bcs?.dataType === "moveObject" &&
                          listingObj.data.bcs.type === "0x2::marketplace::Listing"
                        ) {
                          const listingFields = listingObj.data.bcs
                            .bcsBytes as unknown as Record<string, unknown>;
                          const price = BigInt(
                            (listingFields.price as unknown as { value: string })?.value || "0"
                          );
                          const itemId = (listingFields.card as unknown as { id: string }).id;

                          if (itemId) {
                            const cardObj = await client.getObject({
                              id: itemId,
                              options: {
                                showBcs: true,
                                showType: true,
                              },
                            });

                            const card = parseCardFromObject(cardObj);
                            if (card) {
                              allListings.push({
                                card,
                                kioskId,
                                price,
                                seller,
                              });
                            }
                          }
                        }
                      } catch (err) {
                        console.error(
                          `Failed to fetch listing ${field.objectId}:`,
                          err
                        );
                      }
                    }
                  }

                  dfHasMore = dynamicFields.hasNextPage;
                  dfCursor = dynamicFields.nextCursor;
                }
              } catch (err) {
                console.error(`Failed to fetch kiosk ${kioskId} fields:`, err);
              }
            }
          }
        }

        hasMore = kioskCaps.hasNextPage;
        cursor = kioskCaps.nextCursor;
      }

      setListings(allListings);
      return allListings;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch listings");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, movePackageIdV4, fetchTransferPolicy]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    fetchListings,
    isLoading,
    error,
    transferPolicyId,
  };
}
