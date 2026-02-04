"use client";

import { useState, useEffect } from "react";

interface GameTimerProps {
  expiresAt: number;
}

export function GameTimer({ expiresAt }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(expiresAt - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(expiresAt - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const isExpired = timeLeft <= 0;
  const totalSeconds = Math.max(0, Math.floor(timeLeft / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      className={`text-2xl font-bold font-mono ${isExpired ? "text-red-500" : "text-green-600"}`}
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
