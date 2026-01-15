'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import HeroSection from "./_components/ui/hero-section";
import { FeaturesSection } from "./_components/ui/features-section";
import { HowItWorksSection } from "./_components/ui/how-it-works-section";
import { StatsSection } from "./_components/ui/stats-section";
import { CtaSection } from "./_components/ui/cta-section";

export default function Page() {
	return (
		<div className="flex min-h-screen bg-black">
			<Sidebar />
			<div className="flex-1 flex flex-col">
				<main className="flex-1">
					<HeroSection />
					<FeaturesSection />
					<HowItWorksSection />
					<StatsSection />
					<CtaSection />
				</main>
				<Footer />
			</div>
		</div>
	)
}
