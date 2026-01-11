import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet, EnokiWallet, AuthProvider } from '@mysten/enoki';
import { Button } from '../ui/button';

export default function LoginComponent() {
	const currentAccount = useCurrentAccount();
	const { mutate: connect } = useConnectWallet();

	const wallets = useWallets().filter(isEnokiWallet);
	const walletsByProvider = wallets.reduce(
		(map, wallet) => map.set(wallet.provider, wallet),
		new Map<AuthProvider, EnokiWallet>(),
	);

	const googleWallet = walletsByProvider.get('google');

	if (currentAccount) {
		return <div>Current address: {currentAccount.address}</div>;
	}

	return (
		<>
			{googleWallet ? (
				<Button
					onClick={() => {
						connect({ wallet: googleWallet });
					}}
					type="button"
				>
					Sign in with Google
				</Button>
			) : null}
		</>
	);
}