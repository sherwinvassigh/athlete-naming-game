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
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const game = useQuery(api.games.get, { gameId });
  const athletes = useQuery(api.athletes.listByGame, { gameId });
  const players = useQuery(api.players.listByGame, { gameId });
  const joinGame = useMutation(api.players.join);
  const startGame = useMutation(api.games.start);
  const endGame = useMutation(api.games.end);

  const isStarted = !!game?.startedAt;
  const isUnlimited = !game?.durationMinutes;
  const isEnded = game?.isActive === false;

  // Check if game is expired (timed games) or manually ended
  useEffect(() => {
    if (game) {
      if (isEnded) {
        setIsExpired(true);
      } else if (game.startedAt && game.expiresAt) {
        const checkExpired = () => {
          setIsExpired(Date.now() > game.expiresAt!);
        };
        checkExpired();
        const interval = setInterval(checkExpired, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [game, isEnded]);

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

  const handleStartGame = async () => {
    await startGame({ gameId });
  };

  const handleEndGame = async () => {
    await endGame({ gameId });
    setShowEndConfirm(false);
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

  // Show game over summary when expired or ended
  if ((isExpired || isEnded) && athletes) {
    return (
      <main className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-md mx-auto">
          <GameOverSummary athletes={athletes} />

          {/* Full list below, collapsible on mobile */}
          <details className="mt-6">
            <summary className="text-sm font-semibold text-gray-500 uppercase tracking-wide cursor-pointer text-center">
              View Full List ({athletes.length})
            </summary>
            <div className="mt-3">
              <AthleteList gameId={gameId} />
            </div>
          </details>
        </div>
      </main>
    );
  }

  const playerCount = players?.length ?? 0;

  // LOBBY STATE - Game not started yet
  if (!isStarted) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Athlete Naming Game
            </h1>
            <p className="text-gray-500">
              {game.durationMinutes
                ? `${game.durationMinutes} minute game`
                : "Unlimited time"}
            </p>
          </div>

          {/* Player info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
            <div className="text-sm text-gray-500 mb-1">You joined as</div>
            <div className="text-xl font-semibold text-gray-900">{playerName}</div>
          </div>

          {/* Share link */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm text-gray-500">Share this link with friends:</div>
              <div className="flex items-center gap-1 text-sm">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full font-bold">
                  {playerCount}
                </span>
                <span className="text-gray-500">
                  {playerCount === 1 ? "player" : "players"} joined
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
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Players: </span>
                {players.map((p) => p.playerName).join(", ")}
              </div>
            )}
          </div>

          {/* Start Game Button */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              Start Game
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Anyone can start the game when everyone is ready
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ACTIVE GAME STATE
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-6">
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
            {isUnlimited ? (
              <div className="text-lg font-semibold text-gray-600">Unlimited</div>
            ) : (
              <>
                <div className="text-sm text-gray-500 mb-1">Time remaining</div>
                <GameTimer expiresAt={game.expiresAt!} />
              </>
            )}
          </div>
        </div>

        {/* Player count & End Game */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full font-bold text-sm">
                {playerCount}
              </span>
              <span className="text-sm text-gray-500">
                {playerCount === 1 ? "player" : "players"}
              </span>
              <span className="text-xs text-gray-400">
                ({players?.map((p) => p.playerName).join(", ")})
              </span>
            </div>
            <button
              onClick={() => setShowEndConfirm(true)}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              End Game
            </button>
          </div>
        </div>

        {/* End Game Confirmation Modal */}
        {showEndConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">End Game?</h3>
              <p className="text-gray-600 mb-4">
                This will end the game for all players. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndGame}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  End Game
                </button>
              </div>
            </div>
          </div>
        )}

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
