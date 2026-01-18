"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  CardNames,
  CardType,
  type CardNFT,
} from "@/hooks/use-game-contract-v4";
import { useCollection } from "@/hooks/use-collection";
import { RarityColors, RarityNames, RarityGlow } from "@/lib/gacha";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NFTCard } from "@/components/card/nft-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { value: CardType.SPY, label: CardNames[CardType.SPY] },
  { value: CardType.GUARD, label: CardNames[CardType.GUARD] },
  { value: CardType.PRIEST, label: CardNames[CardType.PRIEST] },
  { value: CardType.BARON, label: CardNames[CardType.BARON] },
  { value: CardType.HANDMAID, label: CardNames[CardType.HANDMAID] },
  { value: CardType.PRINCE, label: CardNames[CardType.PRINCE] },
  { value: CardType.CHANCELLOR, label: CardNames[CardType.CHANCELLOR] },
  { value: CardType.KING, label: CardNames[CardType.KING] },
  { value: CardType.COUNTESS, label: CardNames[CardType.COUNTESS] },
  { value: CardType.PRINCESS, label: CardNames[CardType.PRINCESS] },
];

const DECK_STORAGE_KEY = "relic-of-lies-deck";

interface DeckSelection {
  [role: number]: string; // role -> cardId
}

const RoleSection = React.forwardRef<
  HTMLDivElement,
  {
    role: number;
    roleLabel: string;
    cards: CardNFT[];
    selectedCardId: string | null;
    onCardSelect: (role: number, card: CardNFT) => void;
  }
>(({ role, roleLabel, cards, selectedCardId, onCardSelect }, ref) => {
  if (cards.length === 0) {
    return (
      <div ref={ref} className="space-y-4 scroll-mt-24">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold font-god-of-war tracking-wider text-white">
            {roleLabel}
          </h3>
          <Badge variant="outline" className="text-muted-foreground">
            No cards available
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="space-y-4 scroll-mt-24">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold font-god-of-war tracking-wider text-white">
          {roleLabel}
        </h3>
        {selectedCardId && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
            <Check className="w-3 h-3 mr-1" />
            Selected
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {cards.map((card) => {
          const isSelected = selectedCardId === card.id.id;
          return (
            <div key={card.id.id} className="relative">
              <NFTCard
                card={card}
                onClick={() => onCardSelect(role, card)}
                isSelected={isSelected}
                showStats={true}
                variant="collection"
              />
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

RoleSection.displayName = "RoleSection";

export function MyDeckContent() {
  const currentAccount = useCurrentAccount();
  const { cards, isLoading, fetchCards } = useCollection();
  const [deckSelection, setDeckSelection] = useState<DeckSelection>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [replaceDialog, setReplaceDialog] = useState<{
    open: boolean;
    role: number;
    roleLabel: string;
    oldCard: CardNFT | null;
    newCard: CardNFT;
  } | null>(null);
  
  const roleRefs = useMemo(() => {
    const refs: Record<number, React.RefObject<HTMLDivElement>> = {};
    ROLE_OPTIONS.forEach((role) => {
      refs[role.value] = React.createRef<HTMLDivElement>();
    });
    return refs;
  }, []);

  useEffect(() => {
    if (currentAccount) {
      fetchCards();
      loadDeck();
    }
  }, [currentAccount, fetchCards]);

  const loadDeck = useCallback(() => {
    if (!currentAccount) return;
    try {
      const stored = localStorage.getItem(`${DECK_STORAGE_KEY}-${currentAccount.address}`);
      if (stored) {
        const parsed = JSON.parse(stored) as DeckSelection;
        setDeckSelection(parsed);
      }
    } catch (error) {
      console.error("Failed to load deck:", error);
    }
  }, [currentAccount]);

  const saveDeck = useCallback(() => {
    if (!currentAccount) return;
    try {
      localStorage.setItem(
        `${DECK_STORAGE_KEY}-${currentAccount.address}`,
        JSON.stringify(deckSelection)
      );
      setHasChanges(false);
      toast.success("Deck saved successfully!");
    } catch (error) {
      console.error("Failed to save deck:", error);
      toast.error("Failed to save deck");
    }
  }, [currentAccount, deckSelection]);

  const scrollToRole = useCallback((role: number) => {
    const ref = roleRefs.current[role];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleCardSelect = useCallback(
    (role: number, card: CardNFT) => {
      const currentCardId = deckSelection[role];
      if (currentCardId && currentCardId !== card.id.id) {
        const oldCard = cards.find((c) => c.id.id === currentCardId) || null;
        setReplaceDialog({
          open: true,
          role,
          roleLabel: CardNames[role],
          oldCard,
          newCard: card,
        });
      } else {
        setDeckSelection((prev) => {
          const newSelection = { ...prev, [role]: card.id.id };
          setHasChanges(true);
          return newSelection;
        });
      }
    },
    [deckSelection, cards]
  );

  const handleReplaceConfirm = useCallback(() => {
    if (!replaceDialog) return;
    setDeckSelection((prev) => {
      const newSelection = { ...prev, [replaceDialog.role]: replaceDialog.newCard.id.id };
      setHasChanges(true);
      return newSelection;
    });
    setReplaceDialog(null);
  }, [replaceDialog]);

  const handleEmptySlotClick = useCallback(
    (role: number) => {
      scrollToRole(role);
    },
    [scrollToRole]
  );

  const clearSelection = useCallback((role: number) => {
    setDeckSelection((prev) => {
      const newSelection = { ...prev };
      delete newSelection[role];
      setHasChanges(true);
      return newSelection;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDeckSelection({});
    setHasChanges(true);
  }, []);

  const cardsByRole = useMemo(() => {
    const grouped: Record<number, CardNFT[]> = {};
    ROLE_OPTIONS.forEach((role) => {
      grouped[role.value] = cards.filter((card) => card.value === role.value);
    });
    return grouped;
  }, [cards]);

  const selectedCards = useMemo(() => {
    const selected: Record<number, CardNFT | null> = {};
    ROLE_OPTIONS.forEach((role) => {
      const cardId = deckSelection[role.value];
      if (cardId) {
        selected[role.value] =
          cards.find((card) => card.id.id === cardId) || null;
      } else {
        selected[role.value] = null;
      }
    });
    return selected;
  }, [deckSelection, cards]);

  const selectedCount = Object.keys(deckSelection).length;
  const totalRoles = ROLE_OPTIONS.length;

  if (!currentAccount) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-god-of-war tracking-wider">
            My Deck
          </h1>
          <p className="text-muted-foreground">
            Please connect your wallet to manage your deck
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gradient-to-b from-background via-background to-muted/20">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-god-of-war tracking-wider">
              My Deck
            </h1>
            <p className="text-muted-foreground">
              Select one card for each role. This card will be used for all
              instances of that role in your deck.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {selectedCount} / {totalRoles} roles selected
            </Badge>
            {hasChanges && (
              <Button onClick={saveDeck} className="gap-2">
                <Save className="w-4 h-4" />
                Save Deck
              </Button>
            )}
            {selectedCount > 0 && (
              <Button onClick={clearAll} variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold font-god-of-war tracking-wider">
            Selected Deck
          </h2>
          <div className="flex items-center justify-start gap-4 flex-wrap">
            {ROLE_OPTIONS.map((role) => {
              const selectedCard = selectedCards[role.value];
              return (
                <div key={role.value} className="space-y-2">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">
                      {role.label}
                    </p>
                  </div>
                  {selectedCard ? (
                    <div className="relative">
                      <NFTCard
                        card={selectedCard}
                        onClick={() => scrollToRole(role.value)}
                        isSelected={true}
                        showStats={false}
                        variant="collection"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 p-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelection(role.value);
                        }}
                      >
                        <X className="w-3 h-3 text-white" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-44 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/10 cursor-pointer hover:border-emerald-500/50 hover:bg-muted/20 transition-colors"
                      style={{
                        borderColor: RarityColors[0],
                      }}
                      onClick={() => handleEmptySlotClick(role.value)}
                    >
                      <p className="text-xs text-muted-foreground text-center px-2">
                        Click to select
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading your collection...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🃏</div>
            <h2 className="text-2xl font-semibold">No cards in collection</h2>
            <p className="text-muted-foreground">
              Pull cards from the gacha to build your deck!
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {ROLE_OPTIONS.map((role) => (
              <RoleSection
                key={role.value}
                ref={roleRefs[role.value]}
                role={role.value}
                roleLabel={role.label}
                cards={cardsByRole[role.value] || []}
                selectedCardId={deckSelection[role.value] || null}
                onCardSelect={handleCardSelect}
              />
            ))}
          </div>
        )}
      </div>

      {replaceDialog && (
        <Dialog
          open={replaceDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              setReplaceDialog(null);
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Replace Card?</DialogTitle>
              <DialogDescription>
                Do you want to replace the selected {replaceDialog.roleLabel} card
                with a new one?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-8 py-6">
              {replaceDialog.oldCard && (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Current Card
                  </p>
                  <div className="relative">
                    <NFTCard
                      card={replaceDialog.oldCard}
                      onClick={() => {}}
                      showStats={true}
                      variant="collection"
                    />
                  </div>
                  <div className="text-center">
                    <p
                      className="text-xs font-bold"
                      style={{ color: RarityColors[replaceDialog.oldCard.rarity] }}
                    >
                      {RarityNames[replaceDialog.oldCard.rarity]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {CardNames[replaceDialog.oldCard.value]}
                    </p>
                  </div>
                </div>
              )}
              <ArrowRight className="w-8 h-8 text-muted-foreground" />
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  New Card
                </p>
                <div className="relative">
                  <NFTCard
                    card={replaceDialog.newCard}
                    onClick={() => {}}
                    showStats={true}
                    variant="collection"
                  />
                </div>
                <div className="text-center">
                  <p
                    className="text-xs font-bold"
                    style={{ color: RarityColors[replaceDialog.newCard.rarity] }}
                  >
                    {RarityNames[replaceDialog.newCard.rarity]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CardNames[replaceDialog.newCard.value]}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setReplaceDialog(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleReplaceConfirm}>
                Replace Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
