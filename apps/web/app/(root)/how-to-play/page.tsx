'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import { HowToPlayContent } from "./_components/how-to-play-content";

export default function HowToPlayPage() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1">
				<HowToPlayContent />
				<Footer />
			</div>
		</div>
	);
}
