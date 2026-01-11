import Link from "next/link";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="w-full bg-[#0a0a0a] text-white ">
			<div className="border-border border-t border-white/20 mt-4"></div>
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ">
				{/* Game Title */}
				<div className="mb-8 flex flex-col items-center ">
					<div className="mb-2 flex flex-col items-center">
						<span className="text-xs font-medium tracking-wider text-white sm:text-sm">
							Web3 Card Game on Sui
						</span>
						<span className="text-2xl font-bold uppercase tracking-wider text-white sm:text-3xl lg:text-4xl">
							RELIC OF LIES
						</span>
					</div>
					<p className="mt-2 text-center text-xs text-gray-400 sm:text-sm">
						A Web3 fantasy dungeon-themed card game built on Sui blockchain
					</p>
				</div>

				{/* Navigation Links */}
				<nav className="mb-8 flex flex-wrap items-center justify-center gap-4 border-y border-white/10 py-4">
					<Link
						href="/terms"
						className="text-xs font-bold uppercase tracking-wider text-white transition-colors hover:text-white/80 sm:text-sm"
					>
						TERMS OF SERVICE
					</Link>
					<div className="h-4 w-px bg-white/20" />
					<Link
						href="/privacy"
						className="text-xs font-bold uppercase tracking-wider text-white transition-colors hover:text-white/80 sm:text-sm"
					>
						PRIVACY POLICY
					</Link>
					<div className="h-4 w-px bg-white/20" />
					<Link
						href="/contact"
						className="text-xs font-bold uppercase tracking-wider text-white transition-colors hover:text-white/80 sm:text-sm"
					>
						CONTACT US
					</Link>
				</nav>

				{/* Legal Disclaimers */}
				<div className="mb-6 space-y-3 text-center text-[10px] leading-relaxed text-gray-400 sm:text-xs">
					<p>
						Relic of Lies utilizes zkTunnel (State Channel) pattern with
						Zero-Knowledge Proofs (ZKP) for secure off-chain gameplay and
						on-chain settlement. Powered by Sui blockchain, Enoki (zkLogin), SEAL
						(Sui Encryption & Authentication Layer), and Supabase.
					</p>
					<p>
						Sui, Sui Network, and the Sui logo are trademarks of Mysten Labs,
						Inc. Enoki and zkLogin are trademarks of Enoki Labs. Supabase is a
						trademark of Supabase, Inc. All other trademarks are the property of
						their respective owners.
					</p>
				</div>

				{/* Technology Stack */}
				<div className="mb-6 flex flex-wrap items-center justify-center gap-6">
					<div className="flex items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
							Powered by
						</span>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-4">
						<span className="text-xs font-medium text-gray-400">Sui</span>
						<span className="text-xs text-gray-500">•</span>
						<span className="text-xs font-medium text-gray-400">Enoki</span>
						<span className="text-xs text-gray-500">•</span>
						<span className="text-xs font-medium text-gray-400">zkTunnel</span>
						<span className="text-xs text-gray-500">•</span>
						<span className="text-xs font-medium text-gray-400">Supabase</span>
					</div>
				</div>

				{/* Copyright */}
				<div className="text-center text-[10px] text-gray-400 sm:text-xs">
					<p>
						©{currentYear} Relic of Lies.
						All Rights Reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
