'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { OnChainGameAdapter } from './_components/on-chain-game-adapter';

function GamePageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Room Selected</h1>
          <p className="text-muted-foreground mt-2">
            Please select a room from the lobby to play.
          </p>
          <a href="/rooms" className="mt-4 inline-block text-primary underline">
            Go to Lobby
          </a>
        </div>
      </div>
    );
  }

  return <OnChainGameAdapter roomId={roomId} />;
}

export default function GamePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <GamePageContent />
    </Suspense>
  );
}
