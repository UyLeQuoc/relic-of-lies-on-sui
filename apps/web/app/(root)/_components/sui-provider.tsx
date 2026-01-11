
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
			movePackageId: '0x2e36fba534664c05cd7750232daedeb0725c291a6815042c6bfe748ab3fdbadd',
			roomRegistryId: '0x916dae5a17d657d432a38b8dbcb1cd115740bd5eb579bb3155c87843e8e85609',
			leaderboardId: '0x53f942cd61b502698fe59b19fcff8041b1593b6d85a2b5646d38900020b2cad0',
		},
     },
	mainnet: { url: getFullnodeUrl('mainnet'),
        variables: {
			movePackageId: '0x2e36fba534664c05cd7750232daedeb0725c291a6815042c6bfe748ab3fdbadd',
			roomRegistryId: '0x916dae5a17d657d432a38b8dbcb1cd115740bd5eb579bb3155c87843e8e85609',
			leaderboardId: '0x53f942cd61b502698fe59b19fcff8041b1593b6d85a2b5646d38900020b2cad0',
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
