'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import LoginComponent from '@/components/common/login';
import { Button } from '@/components/ui/button';

export default function SuiTestSection() {
	const currentAccount = useCurrentAccount();

	// Fetch account balance
	const { data: balance, refetch: refetchBalance } = useSuiClientQuery(
		'getBalance',
		{ owner: currentAccount?.address ?? '' },
		{ enabled: !!currentAccount }
	);

	return (
		<div className="space-y-6 p-4">
			<div>
				<div className="text-2xl font-bold">Sui Testnet</div>
				<div className="text-lg text-muted-foreground">
					Test your Sui wallet connection and test the Sui testnet.
				</div>
			</div>

			<div className="space-y-2">
				<h2 className="text-xl font-semibold">Wallet</h2>
				<LoginComponent />
				{currentAccount && balance && (
					<div className="mt-2 flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">Balance:</span>
						<span className="font-medium">
							{(Number(balance.totalBalance) / 1_000_000_000).toFixed(3)} SUI
						</span>
						<Button 
							variant="ghost" 
							size="sm" 
							className="h-6 px-2"
							onClick={() => refetchBalance()}
						>
							↻
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
