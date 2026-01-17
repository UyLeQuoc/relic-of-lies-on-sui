"use client";

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
      <p className="text-2xl font-bold">
        {balance !== null ? `${balance.toFixed(4)} SUI` : "Loading..."}
      </p>
    </div>
  );
}
