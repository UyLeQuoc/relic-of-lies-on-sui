"use client";

import { useSearchParams } from "next/navigation";
import { SealedGameV4 } from "./_components/sealed-game-v4";
import { Suspense } from "react";

function GameV4Content() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Room Selected</h1>
          <p className="text-muted-foreground mt-2">
            Please select a room from the lobby.
          </p>
          <a href="/rooms_v4" className="mt-4 inline-block text-primary underline">
            Go to Lobby
          </a>
        </div>
      </div>
    );
  }

  return <SealedGameV4 roomId={roomId} />;
}

export default function GameV4Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <GameV4Content />
    </Suspense>
  );
}
