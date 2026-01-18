"use client";

import { ThemeProvider } from "next-themes";
import type React from "react";
import SuiProvider from "./sui-provider";
import { BalanceProvider } from "@/contexts/balance-context";

export default function AppProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="light"
			forcedTheme="light"
			disableTransitionOnChange
		>
			<SuiProvider>
				<BalanceProvider>
					{children}
				</BalanceProvider>
			</SuiProvider>
		</ThemeProvider>
	);
}
