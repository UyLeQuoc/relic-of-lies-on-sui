
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
			movePackageId: '0x2bfb147b23f5020e1322f2d9fd5956020d17bc26aa01dc6adbac755436660403',
			roomRegistryId: '0x9325ae27223baf45d104dca67ffe29e7b28fd2c1fee783388dd56c17554d549b',
			leaderboardId: '0x28b9852eeb3efc7db837c53ed66849da759dd01fb02a79f4c6b017a3f082e4f0',
		},
     },
	mainnet: { url: getFullnodeUrl('mainnet'),
        variables: {
			movePackageId: '0x2bfb147b23f5020e1322f2d9fd5956020d17bc26aa01dc6adbac755436660403',
			roomRegistryId: '0x9325ae27223baf45d104dca67ffe29e7b28fd2c1fee783388dd56c17554d549b',
			leaderboardId: '0x28b9852eeb3efc7db837c53ed66849da759dd01fb02a79f4c6b017a3f082e4f0',
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
