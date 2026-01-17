"use client";

import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullButtonProps {
  count: 1 | 10;
  cost: number;
  disabled: boolean;
  isLoading: boolean;
  onClick: () => void;
  className?: string;
}

export const PullButton = forwardRef<HTMLButtonElement, PullButtonProps>(
  ({ count, cost, disabled, isLoading, onClick, className }, ref) => {
    const is10Pull = count === 10;

    return (
      <Button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className={cn(
          "w-48 h-14 text-lg relative overflow-hidden",
          is10Pull &&
            "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Pull {count}
          </>
        )}
        <span className="absolute bottom-1 text-xs opacity-70">{cost} SUI</span>
      </Button>
    );
  }
);

PullButton.displayName = "PullButton";
