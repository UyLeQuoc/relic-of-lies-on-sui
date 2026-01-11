'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import HeroSection from "./_components/ui/hero-section";
import LoginComponent from "@/components/common/login";
import SuiTestSection from "./_components/ui/sui-test-section";

export default function Page() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1">
				<div className="text-2xl font-bold">
					<HeroSection />
					<SuiTestSection />
				</div>
				<Footer />
			</div>
		</div>
	)
}
