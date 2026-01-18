"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  CardNames,
  CardType,
  Rarity,
} from "@/hooks/use-game-contract";
import { useMarketplace } from "@/hooks/use-marketplace";
import { RarityColors, RarityNames } from "@/lib/gacha";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { NFTCard } from "@/components/card/nft-card";
import { CardDetailDialog } from "@/components/card/card-detail-dialog";
import type { MarketplaceListing } from "@/hooks/use-marketplace";
import type { CardNFT } from "@/hooks/use-game-contract";

const RARITY_OPTIONS = [
  {
    value: String(Rarity.MYTHIC),
    label: "Mythic",
    color: RarityColors[Rarity.MYTHIC],
  },
  {
    value: String(Rarity.LEGENDARY),
    label: "Legendary",
    color: RarityColors[Rarity.LEGENDARY],
  },
  {
    value: String(Rarity.EPIC),
    label: "Epic",
    color: RarityColors[Rarity.EPIC],
  },
  {
    value: String(Rarity.RARE),
    label: "Rare",
    color: RarityColors[Rarity.RARE],
  },
  {
    value: String(Rarity.COMMON),
    label: "Common",
    color: RarityColors[Rarity.COMMON],
  },
];

const ROLE_OPTIONS = [
  { value: String(CardType.SPY), label: CardNames[CardType.SPY] },
  { value: String(CardType.GUARD), label: CardNames[CardType.GUARD] },
  { value: String(CardType.PRIEST), label: CardNames[CardType.PRIEST] },
  { value: String(CardType.BARON), label: CardNames[CardType.BARON] },
  { value: String(CardType.HANDMAID), label: CardNames[CardType.HANDMAID] },
  { value: String(CardType.PRINCE), label: CardNames[CardType.PRINCE] },
  { value: String(CardType.CHANCELLOR), label: CardNames[CardType.CHANCELLOR] },
  { value: String(CardType.KING), label: CardNames[CardType.KING] },
  { value: String(CardType.COUNTESS), label: CardNames[CardType.COUNTESS] },
  { value: String(CardType.PRINCESS), label: CardNames[CardType.PRINCESS] },
];

const SORT_OPTIONS = [
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rarity", label: "Rarity" },
];

function MarketplaceFilters({
  selectedRarity,
  selectedRole,
  selectedSort,
  rarityCounts,
  roleCounts,
  totalListings,
  onRarityChange,
  onRoleChange,
  onSortChange,
  onClearFilters,
}: {
  selectedRarity: string | null;
  selectedRole: string | null;
  selectedSort: string | null;
  rarityCounts: Record<string, number>;
  roleCounts: Record<string, number>;
  totalListings: number;
  onRarityChange: (value: string | null) => void;
  onRoleChange: (value: string | null) => void;
  onSortChange: (value: string | null) => void;
  onClearFilters: () => void;
}) {
  const hasFilters =
    selectedRarity !== null || selectedRole !== null || selectedSort !== null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rarity:</span>
          <Select
            value={selectedRarity ?? "all"}
            onValueChange={(value) =>
              onRarityChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Rarities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rarities ({totalListings})</SelectItem>
              {RARITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center justify-between w-full gap-2">
                    <span style={{ color: option.color }}>{option.label}</span>
                    <span className="text-muted-foreground">
                      ({rarityCounts[option.value] ?? 0})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Role:</span>
          <Select
            value={selectedRole ?? "all"}
            onValueChange={(value) =>
              onRoleChange(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles ({totalListings})</SelectItem>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center justify-between w-full gap-2">
                    <span>{option.label}</span>
                    <span className="text-muted-foreground">
                      ({roleCounts[option.value] ?? 0})
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Select
            value={selectedSort ?? "price-low"}
            onValueChange={(value) => onSortChange(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

export function MarketplaceContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentAccount = useCurrentAccount();
  const { listings, isLoading, fetchListings, transferPolicyId } =
    useMarketplace();
  const [selectedListing, setSelectedListing] =
    useState<MarketplaceListing | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedRarity = searchParams.get("rarity");
  const selectedRole = searchParams.get("role");
  const selectedSort = searchParams.get("sort") || "price-low";

  const updateSearchParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const handleRarityChange = useCallback(
    (value: string | null) => {
      updateSearchParams("rarity", value);
    },
    [updateSearchParams]
  );

  const handleRoleChange = useCallback(
    (value: string | null) => {
      updateSearchParams("role", value);
    },
    [updateSearchParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateSearchParams("sort", value);
    },
    [updateSearchParams]
  );

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const filteredListings = useMemo(() => {
    let result = listings;

    if (selectedRarity !== null) {
      const rarityNum = parseInt(selectedRarity, 10);
      result = result.filter((listing) => listing.card.rarity === rarityNum);
    }

    if (selectedRole !== null) {
      const roleNum = parseInt(selectedRole, 10);
      result = result.filter((listing) => listing.card.value === roleNum);
    }

    const sorted = [...result].sort((a, b) => {
      switch (selectedSort) {
        case "price-high":
          return Number(b.price - a.price);
        case "price-low":
          return Number(a.price - b.price);
        case "rarity":
          return b.card.rarity - a.card.rarity;
        default:
          return 0;
      }
    });

    return sorted;
  }, [listings, selectedRarity, selectedRole, selectedSort]);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const listing of listings) {
      const key = String(listing.card.rarity);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [listings]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const listing of listings) {
      const key = String(listing.card.value);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return counts;
  }, [listings]);

  const handleCardClick = useCallback((listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setDialogOpen(true);
  }, []);

  const totalListings = listings.length;
  const filteredCount = filteredListings.length;
  const hasFilters = selectedRarity !== null || selectedRole !== null;

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-god-of-war tracking-wider">
            Marketplace
          </h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading marketplace listings..."
              : hasFilters
                ? `Showing ${filteredCount} of ${totalListings} listings`
                : `${totalListings} card${totalListings !== 1 ? "s" : ""} listed`}
          </p>
        </div>

        {!isLoading && totalListings > 0 && (
          <MarketplaceFilters
            selectedRarity={selectedRarity}
            selectedRole={selectedRole}
            selectedSort={selectedSort}
            rarityCounts={rarityCounts}
            roleCounts={roleCounts}
            totalListings={totalListings}
            onRarityChange={handleRarityChange}
            onRoleChange={handleRoleChange}
            onSortChange={handleSortChange}
            onClearFilters={handleClearFilters}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-32 h-44 rounded-lg" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        ) : totalListings === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🛒</div>
            <h2 className="text-2xl font-semibold">No listings yet</h2>
            <p className="text-muted-foreground">
              Check back later for cards listed by other players!
            </p>
            <Button variant="outline" onClick={fetchListings}>
              Refresh
            </Button>
          </div>
        ) : filteredCount === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Search className="w-10 h-10 mx-auto" />
            <h2 className="text-2xl font-semibold">
              No listings match your filters
            </h2>
            <p className="text-muted-foreground">
              Try adjusting your filters to see more cards.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
            {filteredListings.map((listing) => (
              <NFTCard
                key={listing.card.id.id}
                card={listing.card}
                price={listing.price}
                onClick={() => handleCardClick(listing)}
                showStats={true}
                variant="marketplace"
              />
            ))}
          </div>
        )}
      </div>

      {selectedListing && (
        <CardDetailDialog
          card={selectedListing.card}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedListing(null);
            }
          }}
          mode="marketplace"
          kioskId={selectedListing.kioskId}
          price={selectedListing.price}
          transferPolicyId={transferPolicyId || undefined}
        />
      )}
    </div>
  );
}
