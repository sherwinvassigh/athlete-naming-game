"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AthleteList } from "@/components/AthleteList";
import { PlayerNamePrompt } from "@/components/PlayerNamePrompt";
import { GameOverSummary } from "@/components/GameOverSummary";
import { GameLoadingSpinner, GameNotFound } from "@/components/GameLoading";
import { GameLobby } from "@/components/GameLobby";
import { ActiveGame } from "@/components/ActiveGame";

export default function GamePage() {
  const params = useParams();
  const gameId = params.gameId as Id<"games">;
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
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
  // When a timed game expires, also call endGame to mark it inactive and schedule data cleanup
  useEffect(() => {
    if (game) {
      if (isEnded) {
        setIsExpired(true);
      } else if (game.startedAt && game.expiresAt) {
        const checkExpired = () => {
          const expired = Date.now() > game.expiresAt!;
          if (expired && !isExpired) {
            // Mark game as ended server-side (idempotent — safe if multiple clients call)
            endGame({ gameId }).catch(() => {
              // Non-critical: cleanup will still happen if another client calls end
            });
          }
          setIsExpired(expired);
        };
        checkExpired();
        const interval = setInterval(checkExpired, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [game, isEnded, isExpired, gameId, endGame]);

  // Check for saved player name in localStorage (per-game)
  // Wrapped in try-catch for Safari private browsing / storage-full scenarios
  useEffect(() => {
    try {
      const savedName = localStorage.getItem(`player-name-${gameId}`);
      if (savedName) {
        setPlayerName(savedName);
      }
    } catch {
      // localStorage unavailable — user will see the name prompt
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
    try {
      localStorage.setItem(`player-name-${gameId}`, name);
    } catch {
      // localStorage unavailable — name won't persist across refreshes but game still works
    }
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

  // Loading state
  if (game === undefined) {
    return <GameLoadingSpinner />;
  }

  // Game not found
  if (game === null) {
    return <GameNotFound />;
  }

  // Game over summary — check BEFORE player name prompt so visitors to
  // an ended game link see results instead of a confusing "enter name" screen
  if ((isExpired || isEnded) && athletes) {
    return (
      <main className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <GameOverSummary athletes={athletes} />
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

  // Player name prompt — only shown for active/upcoming games
  if (!playerName) {
    return (
      <main className="min-h-screen">
        <PlayerNamePrompt onSubmit={handlePlayerNameSubmit} />
      </main>
    );
  }

  // Lobby state
  if (!isStarted) {
    return (
      <GameLobby
        playerName={playerName}
        durationMinutes={game.durationMinutes}
        players={players}
        copied={copied}
        actionError={actionError}
        isStarting={isStarting}
        onCopyLink={handleCopyLink}
        onStartGame={handleStartGame}
      />
    );
  }

  // Active game state
  return (
    <ActiveGame
      gameId={gameId}
      playerName={playerName}
      isUnlimited={isUnlimited}
      expiresAt={game.expiresAt}
      isExpired={isExpired}
      players={players}
      actionError={actionError}
      isEnding={isEnding}
      onEndGame={handleEndGame}
    />
  );
}
