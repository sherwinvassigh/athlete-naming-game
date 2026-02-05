"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [actionError, setActionError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Check for saved player name in localStorage (per-game)
  useEffect(() => {
    const savedName = localStorage.getItem(`player-name-${gameId}`);
    if (savedName) {
      setPlayerName(savedName);
    }
  }, [gameId]);

  // Register player when they join - only if game exists and is valid
  useEffect(() => {
    if (playerName && gameId && game) {
      joinGame({ gameId, playerName }).catch(() => {
        // Silently handle join errors - not critical
      });
    }
  }, [playerName, gameId, game, joinGame]);

  const handlePlayerNameSubmit = useCallback((name: string) => {
    localStorage.setItem(`player-name-${gameId}`, name);
    setPlayerName(name);
  }, [gameId]);

  const handleStartGame = useCallback(async () => {
    setActionError(null);
    setIsStarting(true);
    try {
      await startGame({ gameId });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setIsStarting(false);
    }
  }, [gameId, startGame]);

  const handleEndGame = useCallback(async () => {
    setActionError(null);
    setIsEnding(true);
    try {
      await endGame({ gameId });
      setShowEndConfirm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to end game");
    } finally {
      setIsEnding(false);
    }
  }, [gameId, endGame]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  }, []);

  if (game === undefined) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--foreground-muted)]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading game...
        </div>
      </main>
    );
  }

  if (game === null) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🤔</div>
          <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            This game may have been deleted or the link is incorrect.
          </p>
          <Link href="/" className="glow-button inline-block px-6 py-3">
            Create New Game
          </Link>
        </div>
      </main>
    );
  }

  // Show player name prompt if not set
  if (!playerName) {
    return (
      <main className="min-h-screen">
        <PlayerNamePrompt onSubmit={handlePlayerNameSubmit} />
      </main>
    );
  }

  // Show game over summary when expired or ended
  if ((isExpired || isEnded) && athletes) {
    return (
      <main className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <GameOverSummary athletes={athletes} />

          {/* Full list below, collapsible on mobile */}
          <details className="mt-6 glass-card p-4">
            <summary className="text-sm font-medium text-[var(--foreground-muted)] cursor-pointer flex items-center justify-between">
              <span>View Full List</span>
              <span className="text-[var(--accent)] font-bold">{athletes.length}</span>
            </summary>
            <div className="mt-4">
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
      <main className="min-h-screen p-6">
        {/* Subtle background gradient */}
        <div className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="text-center pt-8 pb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-4">
              <span className="text-2xl">⚽</span>
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">
              Game Lobby
            </h1>
            <p className="text-[var(--foreground-subtle)]">
              {game.durationMinutes
                ? `${game.durationMinutes} minute game`
                : "Unlimited time"}
            </p>
          </div>

          {/* Player info card */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-[var(--foreground-subtle)] mb-1">
                  Playing as
                </div>
                <div className="text-lg font-semibold">{playerName}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {playerName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Share link card */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--foreground-muted)]">
                Share this link
              </span>
              <div className="flex items-center gap-2">
                <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-[var(--foreground-subtle)]">
                  {playerCount} {playerCount === 1 ? "player" : "players"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="modern-input flex-1 px-4 py-3 text-sm font-mono truncate"
              />
              <button
                onClick={handleCopyLink}
                className="secondary-button px-4 py-3 min-w-[80px]"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Player list */}
            {players && players.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {players.map((p) => (
                  <span
                    key={p._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--background-tertiary)] text-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {p.playerName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error display */}
          {actionError && (
            <div className="glass-card p-4 border-red-500/50 text-red-400 text-sm text-center">
              {actionError}
            </div>
          )}

          {/* Start Game Button */}
          <div className="pt-4">
            <button
              onClick={handleStartGame}
              disabled={isStarting}
              className="glow-button w-full px-8 py-4 text-lg bg-green-500 hover:bg-green-600 shadow-green-500/25"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 0 20px rgba(16, 185, 129, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)"
              }}
            >
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Starting...
                </span>
              ) : (
                "Start Game"
              )}
            </button>
            <p className="text-sm text-[var(--foreground-subtle)] text-center mt-3">
              Anyone can start when everyone&apos;s ready
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ACTIVE GAME STATE
  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="glass-card p-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold gradient-text">
                Athlete Naming Game
              </h1>
              <LocalClock />
              <div className="text-sm text-[var(--foreground-subtle)] mt-1">
                Playing as <span className="text-[var(--foreground-muted)]">{playerName}</span>
              </div>
            </div>
            <div className="text-right">
              {isUnlimited ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background-tertiary)] text-sm">
                  <span className="text-lg">∞</span>
                  <span className="text-[var(--foreground-muted)]">Unlimited</span>
                </div>
              ) : (
                <div>
                  <div className="text-xs text-[var(--foreground-subtle)] mb-1">Time left</div>
                  <GameTimer expiresAt={game.expiresAt!} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player count & End Game */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
            <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-green-500" />
            <span>{playerCount} {playerCount === 1 ? "player" : "players"}</span>
            <span className="text-[var(--foreground-subtle)]">
              ({players?.map((p) => p.playerName).join(", ")})
            </span>
          </div>
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
          >
            End Game
          </button>
        </div>

        {/* End Game Confirmation Modal */}
        {showEndConfirm && (
          <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold mb-2">End Game?</h3>
              <p className="text-[var(--foreground-muted)] mb-4">
                This will end the game for all players. Are you sure?
              </p>
              {actionError && (
                <p className="text-red-400 text-sm mb-4">{actionError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  disabled={isEnding}
                  className="secondary-button flex-1 px-4 py-3 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndGame}
                  disabled={isEnding}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isEnding ? "Ending..." : "End Game"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <AthleteInput gameId={gameId} playerName={playerName} disabled={isExpired} />

        {/* List */}
        <AthleteList gameId={gameId} />
      </div>
    </main>
  );
}
