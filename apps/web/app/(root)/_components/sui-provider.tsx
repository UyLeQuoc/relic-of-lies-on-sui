
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
			// V1 Contract (original)
			movePackageId: '0x3ae8ac6755ad2f2edcc08969522ebbd164ffd14945d1594f3f65542270bd1673',
			roomRegistryId: '0x0276ad9c9d7ca220118a31b5de9899c7390a2979dbcd537a2743ba8c63f946bb',
			leaderboardId: '0xdb9ee3f2bbea162572ef819a959720f58289956061948740837379bcb4db7220',
			gachaTreasuryId: '0xe766f9bb6e635d10cf96fdabdc820ca8ff4d05bb7e90aaa6f58ef327a9df37aa',
			marketplaceRegistryId: '0xeff646d75222ee3d4f9ba7a097529174d92706a4bbb7198d3cb2d24e5dc01b94',
			// V2 Contract (ZK version) - TODO: Update after deployment
			movePackageIdV2: '0x0000000000000000000000000000000000000000000000000000000000000000',
			roomRegistryIdV2: '0x0000000000000000000000000000000000000000000000000000000000000000',
			leaderboardIdV2: '0x0000000000000000000000000000000000000000000000000000000000000000',
			zkVerificationKeysId: '0x0000000000000000000000000000000000000000000000000000000000000000',
		},
     },
	mainnet: { url: getFullnodeUrl('mainnet'),
        variables: {
			// V1 Contract (original)
			movePackageId: '0x0000000000000000000000000000000000000000000000000000000000000000',
			roomRegistryId: '0x0000000000000000000000000000000000000000000000000000000000000000',
			leaderboardId: '0x0000000000000000000000000000000000000000000000000000000000000000',
			gachaTreasuryId: '0x0000000000000000000000000000000000000000000000000000000000000000',
			marketplaceRegistryId: '0x0000000000000000000000000000000000000000000000000000000000000000',
			// V2 Contract (ZK version) - TODO: Update after deployment
			movePackageIdV2: '0x0000000000000000000000000000000000000000000000000000000000000000',
			roomRegistryIdV2: '0x0000000000000000000000000000000000000000000000000000000000000000',
			leaderboardIdV2: '0x0000000000000000000000000000000000000000000000000000000000000000',
			zkVerificationKeysId: '0x0000000000000000000000000000000000000000000000000000000000000000',
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
            <WalletProvider autoConnect>
            {children}
            </WalletProvider>
        </SuiClientProvider>
    </QueryClientProvider>
  )
}
