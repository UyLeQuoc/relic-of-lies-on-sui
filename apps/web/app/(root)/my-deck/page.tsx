import { Suspense } from "react";
import Header from "@/components/common/header";
import { MyDeckContent } from "./_components/my-deck-content";

export default function MyDeckPage() {
	return (
		<>
			<Header />
			<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
				<MyDeckContent />
			</Suspense>
		</>
	);
}
