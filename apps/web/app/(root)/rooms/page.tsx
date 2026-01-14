'use client';

import Footer from "@/components/common/footer";
import { Sidebar } from "@/components/common/sidebar";
import { RoomsLobby } from "./_components/rooms-lobby";

export default function RoomsPage() {
	return (
		<div className="flex">
			<Sidebar />
			<div className="flex-1">
				<RoomsLobby />
				<Footer />
			</div>
		</div>
	);
}
