"use client";

interface Player {
  _id: string;
  playerName: string;
}

interface GameLobbyProps {
  playerName: string;
  durationMinutes?: number;
  players: Player[] | undefined;
  copied: boolean;
  actionError: string | null;
  isStarting: boolean;
  onCopyLink: () => void;
  onStartGame: () => void;
}

export function GameLobby({
  playerName,
  durationMinutes,
  players,
  copied,
  actionError,
  isStarting,
  onCopyLink,
  onStartGame,
}: GameLobbyProps) {
  const playerCount = players?.length ?? 0;

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
            {durationMinutes
              ? `${durationMinutes} minute game`
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
              onClick={onCopyLink}
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
            onClick={onStartGame}
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
