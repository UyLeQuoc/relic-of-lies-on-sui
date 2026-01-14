'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import { NewsContent } from "./_components/news-content";

export default function NewsPage() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1">
				<NewsContent />
				<Footer />
			</div>
		</div>
	);
}
