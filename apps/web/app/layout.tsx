import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Relic of Lies - Web3 Card Game on Sui",
	description:
		"A fantasy dungeon-themed card game built on the Sui blockchain. Play turn-based elimination matches, stake Sui coins, and earn rewards through smart contract-enforced gameplay.",
	keywords: [
		"Relic of Lies",
		"Web3 card game",
		"Sui blockchain",
		"blockchain game",
		"card game",
		"multiplayer game",
		"zkTunnel",
		"Enoki",
		"SEAL",
		"Supabase",
	],
	authors: [{ name: "Relic of Lies Team" }],
	creator: "Relic of Lies",
	publisher: "Relic of Lies",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
	),
	icons: {
		icon: [
			{ url: "/images/logo/main.ico", sizes: "any" },
			{ url: "/images/logo/main.png", type: "image/png" },
		],
		apple: "/images/logo/main.png",
		shortcut: "/images/logo/main.ico",
	},
	openGraph: {
		title: "Relic of Lies - Web3 Card Game on Sui",
		description:
			"A fantasy dungeon-themed card game built on the Sui blockchain. Play turn-based elimination matches, stake Sui coins, and earn rewards.",
		url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
		siteName: "Relic of Lies",
		type: "website",
		locale: "en_US",
		images: [
			{
				url: "/images/logo/main.png",
				width: 1200,
				height: 630,
				alt: "Relic of Lies - Web3 Card Game on Sui",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Relic of Lies - Web3 Card Game on Sui",
		description:
			"A fantasy dungeon-themed card game built on the Sui blockchain.",
		images: ["/images/logo/main.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={inter.variable}>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
