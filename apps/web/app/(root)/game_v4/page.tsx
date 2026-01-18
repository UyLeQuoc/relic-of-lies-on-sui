"use client";

import { useSearchParams } from "next/navigation";
import { SealedGameAdapterV4 } from "./_components/sealed-game-adapter-v4";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function GameV4Content() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">No Room Selected</h1>
          <p className="text-amber-300/70 mt-2">
            Please select a room from the lobby.
          </p>
          <a href="/rooms_v4" className="mt-4 inline-block text-amber-400 underline hover:text-amber-300">
            Go to Lobby
          </a>
        </div>
      </div>
    );
  }

  return <SealedGameAdapterV4 roomId={roomId} />;
}

export default function GameV4Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
            <p className="text-amber-300">Loading game...</p>
          </div>
        </div>
      }
    >
      <GameV4Content />
    </Suspense>
  );
}
