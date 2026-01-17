'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { SealedGameAdapter } from './_components/sealed-game-adapter';

function GameV3PageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-violet-400">No Room Selected</h1>
          <p className="text-muted-foreground mt-2">
            Please select a room from the lobby to play.
          </p>
          <a href="/rooms_v3" className="mt-4 inline-block text-violet-400 underline">
            Go to Sealed Lobby
          </a>
        </div>
      </div>
    );
  }

  return <SealedGameAdapter roomId={roomId} />;
}

export default function GameV3Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-violet-950/20 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto" />
          <p className="mt-4 text-violet-300">Loading sealed game...</p>
        </div>
      </div>
    }>
      <GameV3PageContent />
    </Suspense>
  );
}
