"use client";

import Link from "next/link";

export function GameLoadingSpinner() {
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

export function GameNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <div className="glass-card p-8 text-center max-w-md">
        <div className="text-5xl mb-4">👋</div>
        <h2 className="text-xl font-bold mb-2">Game Over</h2>
        <p className="text-[var(--foreground-muted)] mb-6">
          This game has ended and the results have been cleared. Start a new game to play again!
        </p>
        <Link href="/" className="glow-button inline-block px-6 py-3">
          New Game
        </Link>
      </div>
    </main>
  );
}
