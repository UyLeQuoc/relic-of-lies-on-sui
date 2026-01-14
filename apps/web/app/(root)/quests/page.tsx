'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import { QuestsContent } from "./_components/quests-content";

export default function QuestsPage() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1">
				<QuestsContent />
				<Footer />
			</div>
		</div>
	);
}
