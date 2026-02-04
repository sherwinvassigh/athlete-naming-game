"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AthleteInput } from "@/components/AthleteInput";
import { AthleteList } from "@/components/AthleteList";
import { GameTimer } from "@/components/GameTimer";
import { LocalClock } from "@/components/LocalClock";
import { PlayerNamePrompt } from "@/components/PlayerNamePrompt";
import { GameOverSummary } from "@/components/GameOverSummary";
import Link from "next/link";

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as Id<"games">;
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const game = useQuery(api.games.get, { gameId });
  const athletes = useQuery(api.athletes.listByGame, { gameId });

  // Check if game is expired
  useEffect(() => {
    if (game) {
      const checkExpired = () => {
        setIsExpired(Date.now() > game.expiresAt);
      };
      checkExpired();
      const interval = setInterval(checkExpired, 1000);
      return () => clearInterval(interval);
    }
  }, [game]);

  // Check for saved player name in localStorage
  useEffect(() => {
    const savedName = localStorage.getItem(`player-name-${gameId}`);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, [gameId]);

  const handlePlayerNameSubmit = (name: string) => {
    localStorage.setItem(`player-name-${gameId}`, name);
    setPlayerName(name);
  };

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

  // Show player name prompt if not set
  if (!playerName) {
    return (
      <main className="min-h-screen bg-gray-50">
        <PlayerNamePrompt onSubmit={handlePlayerNameSubmit} />
      </main>
    );
  }

  // Show game over summary when expired
  if (isExpired && athletes) {
    return (
      <main className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <GameOverSummary athletes={athletes} />

        {/* Still show the full list below */}
        <div className="mt-8 w-full max-w-md">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
            Full List
          </h3>
          <AthleteList gameId={gameId} />
        </div>
      </main>
    );
  }

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
            <div className="text-sm text-gray-500 mt-1">
              Playing as <span className="font-medium text-gray-700">{playerName}</span>
            </div>
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
          <AthleteInput gameId={gameId} playerName={playerName} disabled={isExpired} />
        </div>

        {/* List */}
        <div className="flex justify-center">
          <AthleteList gameId={gameId} />
        </div>
      </div>
    </main>
  );
}
