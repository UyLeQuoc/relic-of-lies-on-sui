'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ZKGameAdapter } from './_components/zk-game-adapter';

function GamePageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-400">No Room Selected</h1>
          <p className="text-slate-400 mt-2">
            Please select a room from the lobby to play.
          </p>
          <a href="/rooms_v2" className="mt-4 inline-block text-amber-400 underline hover:text-amber-300">
            Go to Lobby
          </a>
        </div>
      </div>
    );
  }

  return <ZKGameAdapter roomId={roomId} />;
}

export default function GamePageV2() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto" />
          <p className="mt-4 text-slate-400">Loading game...</p>
        </div>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  );
}
