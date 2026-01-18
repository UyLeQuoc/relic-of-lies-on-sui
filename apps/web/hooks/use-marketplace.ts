"use client";

import { useCallback, useState, useEffect } from "react";
import { useSuiClient } from "@mysten/dapp-kit";
import { useNetworkConfig } from "@/app/(root)/_components/sui-provider";
import type { CardNFT } from "@/hooks/use-game-contract";

export interface MarketplaceListing {
  card: CardNFT;
  kioskId: string;
  price: bigint;
  seller: string;
}

export function useMarketplace() {
  const client = useSuiClient();
  const {
    variables: { movePackageId, marketplaceRegistryId },
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
      const cardType = `${movePackageId}::gacha::Card`;
      const policyType = `0x2::transfer_policy::TransferPolicy<${cardType}>`;

      const sharedResponse = await client.queryObjects({
        filter: {
          StructType: policyType,
        },
        options: {
          showContent: true,
        },
      });

      if (sharedResponse.data.length > 0) {
        const policyId = sharedResponse.data[0].data?.objectId || null;
        setTransferPolicyId(policyId);
        return policyId;
      }

      return null;
    } catch (err) {
      console.error("Failed to fetch transfer policy:", err);
      return null;
    }
  }, [client, movePackageId]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const policyId = await fetchTransferPolicy();
      if (!policyId) {
        console.warn("Transfer policy not found, purchases may fail");
      }

      const allListings: MarketplaceListing[] = [];

      const cardType = `${movePackageId}::gacha::Card`;
      const listingKeyType = `0x2::kiosk::Listing<${cardType}>`;

      let cursor: string | null | undefined = undefined;
      let hasMore = true;

      while (hasMore) {
        const kioskCaps = await client.getOwnedObjects({
          filter: {
            StructType: "0x2::kiosk::KioskOwnerCap",
          },
          options: {
            showContent: true,
          },
          limit: 50,
          cursor: cursor ?? undefined,
        });

        for (const capObj of kioskCaps.data) {
          if (
            capObj.data?.content?.dataType === "moveObject" &&
            capObj.data.content.fields
          ) {
            const fields = capObj.data.content.fields as Record<
              string,
              unknown
            >;
            const kioskId = fields.for as string;
            const owner = capObj.data.owner;

            if (typeof owner === "object" && "AddressOwner" in owner) {
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
                            showContent: true,
                            showType: true,
                          },
                        });

                        if (
                          listingObj.data?.content?.dataType === "moveObject" &&
                          listingObj.data.content.fields
                        ) {
                          const listingFields = listingObj.data.content
                            .fields as Record<string, unknown>;
                          const price = BigInt(
                            (listingFields.price as string) || "0"
                          );
                          const itemId = listingFields.id as string;

                          if (itemId) {
                            const cardObj = await client.getObject({
                              id: itemId,
                              options: {
                                showContent: true,
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
  }, [client, movePackageId, fetchTransferPolicy]);

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
