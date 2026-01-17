
import React, { useEffect } from 'react'
import { createNetworkConfig, SuiClientProvider, useSuiClientContext, WalletProvider } from '@mysten/dapp-kit';
import { registerEnokiWallets, isEnokiNetwork } from '@mysten/enoki';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@mysten/dapp-kit/dist/index.css';

// Config options for the networks you want to connect to
export const { networkConfig, useNetworkConfig } = createNetworkConfig({
	testnet: { url: getFullnodeUrl('testnet'),
        variables: {
			movePackageId: '0xb6518196a527470c019f7be0592a270c3913e81de5fb2398e40c449fc705f368',
			roomRegistryId: '0x45e48f70e97044a1e8483a737de9758bd7f974129b819a7265d979178fcb8c5c',
			leaderboardId: '0xd51551dda28c96b903129a52127c574f24edb6b40fd4d94f871af031b46d3550',
		},
     },
	mainnet: { url: getFullnodeUrl('mainnet'),
        variables: {
			movePackageId: '0xb6518196a527470c019f7be0592a270c3913e81de5fb2398e40c449fc705f368',
			roomRegistryId: '0x45e48f70e97044a1e8483a737de9758bd7f974129b819a7265d979178fcb8c5c',
			leaderboardId: '0xd51551dda28c96b903129a52127c574f24edb6b40fd4d94f871af031b46d3550',
		},
     },
});

const queryClient = new QueryClient();

function RegisterEnokiWallets() {
	const { client, network } = useSuiClientContext();
	useEffect(() => {
		if (!isEnokiNetwork(network)) return;
		const { unregister } = registerEnokiWallets({
			apiKey: 'enoki_public_32ab0ecb006e7fc7084a6561ec9d72bc',
			providers: {
				// Provide the client IDs for each of the auth providers you want to use:
				google: {
					clientId: '623062701801-5r22nj9gs5cvhf1i0e21ca271bn9n5t7.apps.googleusercontent.com',
				},
			},
			client,
			network,
		});
		return unregister;
	}, [client, network]);
	return null;
}


export default function SuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet"
			createClient={(network, config) => {
				return new SuiClient({
					network,
					url: config.url,
					mvr: {
						overrides: {
							packages: {
								'@local-pkg/contract': config.variables.movePackageId,
							},
						},
					},
				});
			}}
		>
            <RegisterEnokiWallets />
            <WalletProvider>
            {children}
            </WalletProvider>
        </SuiClientProvider>
    </QueryClientProvider>
  )
}
