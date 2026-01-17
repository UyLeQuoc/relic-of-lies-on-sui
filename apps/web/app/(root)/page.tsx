import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import { CtaSection } from "./_components/ui/cta-section";
import { FeaturesSection } from "./_components/ui/features-section";
import HeroSection from "./_components/ui/hero-section";
import { HowItWorksSection } from "./_components/ui/how-it-works-section";
import { StatsSection } from "./_components/ui/stats-section";

export default function Page() {
	return (
		<>
			<Header />
			<HeroSection />
			<FeaturesSection />
			<HowItWorksSection />
			<StatsSection />
			<CtaSection />
			<Footer />
		</>
	);
}
