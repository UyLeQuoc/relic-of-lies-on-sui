"use client";

import Image from "next/image";

interface BalanceDisplayProps {
  balance: number | null;
  isConnected: boolean;
}

export function BalanceDisplay({ balance, isConnected }: BalanceDisplayProps) {
  if (!isConnected) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Connect wallet to pull cards</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">Balance</p>
      <p className="text-2xl font-bold flex items-center justify-center gap-1">
        {balance !== null ? (
          <>
            {balance.toFixed(4)}
            <Image
              src="/images/logo/sui-sui-logo.svg"
              alt="SUI"
              width={24}
              height={24}
              className="inline-block size-6"
            />
          </>
        ) : (
          "Loading..."
        )}
      </p>
    </div>
  );
}
