"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
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
  const players = useQuery(api.players.listByGame, { gameId });
  const joinGame = useMutation(api.players.join);

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

  // Register player when they join
  useEffect(() => {
    if (playerName && gameId) {
      joinGame({ gameId, playerName });
    }
  }, [playerName, gameId, joinGame]);

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

  const playerCount = players?.length ?? 0;

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

        {/* Player count & Share link */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-500">Share this link with friends:</div>
            <div className="flex items-center gap-1 text-sm">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full font-bold">
                {playerCount}
              </span>
              <span className="text-gray-500">
                {playerCount === 1 ? "player" : "players"}
              </span>
            </div>
          </div>
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
          {/* Show player names */}
          {players && players.length > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              {players.map((p) => p.playerName).join(", ")}
            </div>
          )}
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
