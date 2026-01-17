
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
			movePackageId: '0x8fcb5611d1261dbe809549cf621d65fad125aec3f62b9d131ae7d56c3a445ca6',
			roomRegistryId: '0xd2555ba92a02874ed8697fc8513cf65b7cb3db2a7c0c40eed14d8f5dd5bfc300',
			leaderboardId: '0xf6c845b7fc53e9f17844dd077286c093ca184199a069e388398f26b80c7968b8',
		},
     },
	mainnet: { url: getFullnodeUrl('mainnet'),
        variables: {
			movePackageId: '0x8fcb5611d1261dbe809549cf621d65fad125aec3f62b9d131ae7d56c3a445ca6',
			roomRegistryId: '0xd2555ba92a02874ed8697fc8513cf65b7cb3db2a7c0c40eed14d8f5dd5bfc300',
			leaderboardId: '0xf6c845b7fc53e9f17844dd077286c093ca184199a069e388398f26b80c7968b8',
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
