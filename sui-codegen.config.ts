import type { SuiCodegenConfig } from '@mysten/codegen';

const config: SuiCodegenConfig = {
	output: './apps/web/contracts/generated',
	generateSummaries: true,
	prune: false,
	packages: [
		{
			package: '@local-pkg/contract-v4',
			path: './apps/contract-v4',
		},
	],
};

export default config;