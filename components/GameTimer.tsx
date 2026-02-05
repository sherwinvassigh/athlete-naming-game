"use client";

import { useState, useEffect } from "react";

interface GameTimerProps {
  expiresAt: number;
}

export function GameTimer({ expiresAt }: GameTimerProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    // Set initial time on mount
    setTimeLeft(expiresAt - Date.now());

    const interval = setInterval(() => {
      setTimeLeft(expiresAt - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  // Show placeholder during SSR
  if (!mounted) {
    return (
      <div className="text-2xl font-bold font-mono text-[var(--accent)]">
        --:--
      </div>
    );
  }

  const isExpired = timeLeft <= 0;
  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Warning state when under 1 minute
  const isWarning = totalSeconds < 60 && totalSeconds > 0;

  return (
    <div
      className={`text-2xl font-bold font-mono ${
        isExpired
          ? "text-red-400"
          : isWarning
            ? "text-orange-400 animate-pulse"
            : "text-[var(--success)]"
      }`}
    >
      {isExpired ? (
        "Time's up!"
      ) : (
        <>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </>
      )}
    </div>
  );
}
