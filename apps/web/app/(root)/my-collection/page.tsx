import { Suspense } from "react";
import Header from "@/components/common/header";
import { MyCollectionContent } from "./_components/my-collection-content";

export default function MyCollectionPage() {
	return (
		<>
			<Header />
			<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
				<MyCollectionContent />
			</Suspense>
		</>
	);
}
