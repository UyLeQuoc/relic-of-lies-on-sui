"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { MIST_PER_SUI } from "@mysten/sui/utils";

interface BalanceContextType {
  balance: number | null;
  error: Error | null;
  refetch: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address;

  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const suiClient = useMemo(
    () =>
      new SuiClient({
        url: getFullnodeUrl("testnet"),
      }),
    []
  );

  const refetch = useCallback(async () => {
    if (!address) {
      setBalance(null);
      setError(null);
      return;
    }

    try {
      setError(null);

      const { totalBalance } = await suiClient.getBalance({
        owner: address,
      });
      const balanceInSui = Number(totalBalance) / Number(MIST_PER_SUI);

      setBalance(balanceInSui);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setError(err as Error);
      setBalance(null);
    }
  }, [address, suiClient]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!cancelled) {
        await refetch();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refetch]);

  const value = useMemo(
    () => ({ balance, error, refetch }),
    [balance, error, refetch]
  );

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}
