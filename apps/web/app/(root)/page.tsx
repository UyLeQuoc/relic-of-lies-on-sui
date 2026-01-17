import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import HeroSection from "./_components/ui/hero-section";
import { FeaturesSection } from "./_components/ui/features-section";
import { HowItWorksSection } from "./_components/ui/how-it-works-section";
import { StatsSection } from "./_components/ui/stats-section";
import { CtaSection } from "./_components/ui/cta-section";

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
