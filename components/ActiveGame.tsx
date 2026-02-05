"use client";

import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { AthleteInput } from "@/components/AthleteInput";
import { AthleteList } from "@/components/AthleteList";
import { GameTimer } from "@/components/GameTimer";
import { LocalClock } from "@/components/LocalClock";

interface Player {
  _id: string;
  playerName: string;
}

interface ActiveGameProps {
  gameId: Id<"games">;
  playerName: string;
  isUnlimited: boolean;
  expiresAt?: number;
  isExpired: boolean;
  players: Player[] | undefined;
  actionError: string | null;
  isEnding: boolean;
  onEndGame: () => void;
}

export function ActiveGame({
  gameId,
  playerName,
  isUnlimited,
  expiresAt,
  isExpired,
  players,
  actionError,
  isEnding,
  onEndGame,
}: ActiveGameProps) {
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const playerCount = players?.length ?? 0;

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
                  <GameTimer expiresAt={expiresAt!} />
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
                  onClick={onEndGame}
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
