"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AthleteInput } from "@/components/AthleteInput";
import { AthleteList } from "@/components/AthleteList";
import { GameTimer } from "@/components/GameTimer";
import { LocalClock } from "@/components/LocalClock";
import Link from "next/link";

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as Id<"games">;

  const game = useQuery(api.games.get, { gameId });

  if (game === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading game...</div>
      </main>
    );
  }

  if (game === null) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">Game not found</div>
        <Link href="/" className="text-blue-600 hover:underline">
          Start a new game
        </Link>
      </main>
    );
  }

  const isExpired = Date.now() > game.expiresAt;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Athlete Naming Game
            </h1>
            <LocalClock />
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Time remaining</div>
            <GameTimer expiresAt={game.expiresAt} />
          </div>
        </div>

        {/* Share link */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Share this link with friends:</div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={typeof window !== "undefined" ? window.location.href : ""}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm font-mono"
            />
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="flex justify-center">
          <AthleteInput gameId={gameId} disabled={isExpired} />
        </div>

        {isExpired && (
          <div className="text-center">
            <p className="text-red-500 font-semibold mb-4">Game Over!</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Game
            </Link>
          </div>
        )}

        {/* List */}
        <div className="flex justify-center">
          <AthleteList gameId={gameId} />
        </div>
      </div>
    </main>
  );
}
