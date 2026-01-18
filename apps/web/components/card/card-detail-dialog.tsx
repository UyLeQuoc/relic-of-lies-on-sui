"use client";

import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RarityColors, RarityNames, RarityGlow, mistToSui } from "@/lib/gacha";
import type { CardNFT } from "@/hooks/use-game-contract";
import { CardNames } from "@/hooks/use-game-contract";
import {
  usePurchaseCard,
  useListCard,
  useCreateKiosk,
  useGetMyKiosk,
} from "@/hooks/use-game-contract";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CardDetailDialogProps {
  card: CardNFT | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "marketplace" | "collection";
  kioskId?: string;
  price?: bigint;
  transferPolicyId?: string;
}

export function CardDetailDialog({
  card,
  open,
  onOpenChange,
  mode = "collection",
  kioskId,
  price,
  transferPolicyId,
}: CardDetailDialogProps) {
  const currentAccount = useCurrentAccount();
  const { purchaseCard, isPending: isPurchasing } = usePurchaseCard();
  const { listCard, isPending: isListing } = useListCard();
  const { createKiosk, isPending: isCreatingKiosk } = useCreateKiosk();
  const { kioskId: myKioskId, kioskCapId: myKioskCapId, fetchKiosk } =
    useGetMyKiosk();
  const [listPrice, setListPrice] = useState("");

  const handlePurchase = useCallback(async () => {
    if (!card || !kioskId || price === undefined || !transferPolicyId) {
      toast.error("Missing required information for purchase");
      return;
    }

    try {
      await purchaseCard(kioskId, card.id.id, price, transferPolicyId);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [card, kioskId, price, transferPolicyId, purchaseCard, onOpenChange]);

  const handleListCard = useCallback(async () => {
    if (!card || !listPrice) {
      toast.error("Please enter a price");
      return;
    }

    const priceNum = parseFloat(listPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      let kioskIdToUse = myKioskId;
      let kioskCapIdToUse = myKioskCapId;

      if (!kioskIdToUse || !kioskCapIdToUse) {
        toast.info("Creating kiosk...");
        const result = await createKiosk();
        if (result.kioskId && result.capId) {
          kioskIdToUse = result.kioskId;
          kioskCapIdToUse = result.capId;
        } else {
          toast.error("Failed to create kiosk");
          return;
        }
      }

      await listCard(kioskIdToUse, kioskCapIdToUse, card.id.id, priceNum);
      setListPrice("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [
    card,
    listPrice,
    myKioskId,
    myKioskCapId,
    createKiosk,
    listCard,
    onOpenChange,
  ]);

  if (!card) return null;

  const isLoading = isPurchasing || isListing || isCreatingKiosk;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[540px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle
            className="text-xl font-god-of-war"
            style={{ color: RarityColors[card.rarity] }}
          >
            {CardNames[card.value]}
          </DialogTitle>
          <DialogDescription>Card Details</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            <div className="flex justify-center px-4">
              <div
                className="relative w-48 h-64 rounded-lg overflow-hidden"
                style={{
                  backgroundColor: "#1a1a2e",
                  border: `3px solid ${RarityColors[card.rarity]}`,
                  boxShadow: RarityGlow[card.rarity],
                }}
              >
                <img
                  src={`/images/cards/characters/${card.value}.png`}
                  alt={CardNames[card.value]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                  <p
                    className="text-sm font-bold text-center"
                    style={{ color: RarityColors[card.rarity] }}
                  >
                    {RarityNames[card.rarity]}
                  </p>
                  <p className="text-sm text-center text-white/80">
                    {CardNames[card.value]}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4 px-4">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Object ID
                </h4>
                <p className="text-sm font-mono break-all bg-muted/50 p-3 rounded-md">
                  {card.id.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Card Value
                  </h4>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Rarity
                  </h4>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: RarityColors[card.rarity],
                      color: RarityColors[card.rarity],
                    }}
                  >
                    {RarityNames[card.rarity]}
                  </Badge>
                </div>
              </div>

              {mode === "marketplace" && price !== undefined && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Price
                  </h4>
                  <p className="text-3xl font-bold text-yellow-400">
                    {mistToSui(price).toFixed(2)} SUI
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-500">
                      {card.wins.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total Wins
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-500">
                      {card.games_played.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Games Played
                    </p>
                  </div>
                </div>
              </div>

              {card.games_played > BigInt(0) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Win Rate
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Performance
                      </span>
                      <span className="text-lg font-bold">
                        {(
                          (Number(card.wins) / Number(card.games_played)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                        style={{
                          width: `${(Number(card.wins) / Number(card.games_played)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode === "collection" && (
                <div className="space-y-2">
                  <Separator />
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    List for Sale
                  </h4>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (SUI)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          {mode === "marketplace" && price !== undefined && (
            <Button
              onClick={handlePurchase}
              disabled={isLoading || !currentAccount}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Buy for ${mistToSui(price).toFixed(2)} SUI`
              )}
            </Button>
          )}
          {mode === "collection" && (
            <Button
              onClick={handleListCard}
              disabled={isLoading || !listPrice || !currentAccount}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isCreatingKiosk
                    ? "Creating kiosk..."
                    : isListing
                      ? "Listing card..."
                      : "Processing..."}
                </>
              ) : (
                "List for Sale"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
