
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
			movePackageId: '0xdcbb888938c246e5c4376e354ab9b6da16053ab65bacb0201278625fbca6bb7b',
			roomRegistryId: '0x006a11eadd389befdef00365475f39794a0b7dd12b6d88db84916d39540b07ec',
			leaderboardId: '0xeda1e559dcac3bf72ba93e478344811fcc46796f386ceab35a0c438d6e914b21',
			gachaTreasuryId: '0x24f86ffab9e8073abcc1837e4903134a9c6eaf1fc66830a060f24e304eae9ea0',
			marketplaceRegistryId: '0x271bbccb88497fb14745ec44d73f63c0de26a1459c0d0399ba8564a6b592f466',
			cardId: '0xe25e142d8f3cd2ed18f8737da31783b10de40e84b74501f7adac74fd72c46ee6',
			publisherId: '0xba1947a28d36d5eec23a4c4535b20de8c2f7b4bbfdda4e09eb46450db56fcf75',
		},
     },
	mainnet: { url: getFullnodeUrl('mainnet'),
        variables: {
			movePackageId: '0xdcbb888938c246e5c4376e354ab9b6da16053ab65bacb0201278625fbca6bb7b',
			roomRegistryId: '0x006a11eadd389befdef00365475f39794a0b7dd12b6d88db84916d39540b07ec',
			leaderboardId: '0xeda1e559dcac3bf72ba93e478344811fcc46796f386ceab35a0c438d6e914b21',
			gachaTreasuryId: '0x24f86ffab9e8073abcc1837e4903134a9c6eaf1fc66830a060f24e304eae9ea0',
			marketplaceRegistryId: '0x271bbccb88497fb14745ec44d73f63c0de26a1459c0d0399ba8564a6b592f466',
			cardId: '0xe25e142d8f3cd2ed18f8737da31783b10de40e84b74501f7adac74fd72c46ee6',
			publisherId: '0xba1947a28d36d5eec23a4c4535b20de8c2f7b4bbfdda4e09eb46450db56fcf75',
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
