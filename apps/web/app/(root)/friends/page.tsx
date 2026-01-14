'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import { FriendsContent } from "./_components/friends-content";

export default function FriendsPage() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1">
				<FriendsContent />
				<Footer />
			</div>
		</div>
	);
}
