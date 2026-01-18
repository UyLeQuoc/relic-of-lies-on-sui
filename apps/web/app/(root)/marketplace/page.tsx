import { Suspense } from "react";
import { MarketplaceContent } from "./_components/marketplace-content";

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
