import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useSuiBalance(address?: string) {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Create the client once
  const suiClient = useMemo(
    () =>
      new SuiClient({
        url: getFullnodeUrl("testnet"),
      }),
    []
  );

  const getBalance = useCallback(async () => {
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
      console.log(totalBalance);
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
        await getBalance();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [getBalance]);

  return { balance, error, refetch: getBalance };
}
