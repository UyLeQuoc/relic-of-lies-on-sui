"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg";
}

export function CopyButton({ value, className, size = "icon-xs" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={cn(
            "text-zinc-400 hover:text-white hover:bg-zinc-800",
            className
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="text-green-500" />
          ) : (
            <Copy />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {copied ? "Copied!" : "Copy to clipboard"}
      </TooltipContent>
    </Tooltip>
  );
}
