"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface Athlete {
  _id: string;
  name: string;
  playerName?: string;
}

interface GameOverSummaryProps {
  athletes: Athlete[];
}

export function GameOverSummary({ athletes }: GameOverSummaryProps) {
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger confetti on mount with proper cleanup
  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let cancelled = false;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      if (cancelled) return;

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });

      if (Date.now() < end && !cancelled) {
        animationRef.current = requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst in the middle
    timeoutRef.current = setTimeout(() => {
      if (!cancelled) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        });
      }
    }, 500);

    // Cleanup function
    return () => {
      cancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Count athletes per player
  const playerCounts = athletes.reduce((acc, athlete) => {
    const name = athlete.playerName || "Anonymous";
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort players by count (highest first)
  const sortedPlayers = Object.entries(playerCounts).sort((a, b) => b[1] - a[1]);

  // Export results as text file
  const handleExport = () => {
    const date = new Date().toLocaleDateString();
    let content = `Athlete Naming Game Results - ${date}\n`;
    content += `${"=".repeat(40)}\n\n`;
    content += `Total Athletes Named: ${athletes.length}\n\n`;

    if (sortedPlayers.length > 0) {
      content += `Player Breakdown:\n`;
      sortedPlayers.forEach(([playerName, count], index) => {
        const trophy = index === 0 && sortedPlayers.length > 1 ? " 🏆" : "";
        content += `  ${playerName}: ${count}${trophy}\n`;
      });
      content += `\n`;
    }

    content += `All Athletes:\n`;
    content += `${"-".repeat(40)}\n`;
    athletes.forEach((athlete, index) => {
      const by = athlete.playerName ? ` (${athlete.playerName})` : "";
      content += `${index + 1}. ${athlete.name}${by}\n`;
    });

    // Create and download file with proper cleanup
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athlete-game-results-${date.replace(/\//g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share results (native share or copy to clipboard)
  const handleShare = async () => {
    const text = `Athlete Naming Game Results!\n\nWe named ${athletes.length} athletes!\n\n${sortedPlayers.map(([name, count], i) => `${i === 0 && sortedPlayers.length > 1 ? "🏆 " : ""}${name}: ${count}`).join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or share failed - silent fail is OK
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Results copied to clipboard!");
      } catch {
        // Clipboard failed - alert user
        alert("Could not copy to clipboard");
      }
    }
  };

  return (
    <div className="glass-card p-6 w-full">
      {/* Screenshot-friendly header section */}
      <div className="text-center pb-6 border-b border-[var(--border)] mb-6">
        <div className="trophy-shine text-5xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold gradient-text mb-2">
          Game Complete!
        </h2>
        <div className="stat-value text-6xl my-4">
          {athletes.length}
        </div>
        <p className="text-[var(--foreground-muted)] font-medium">athletes named</p>
      </div>

      {/* Player breakdown - prominent for screenshots */}
      {sortedPlayers.length > 0 && (
        <div className="mb-6 space-y-2">
          {sortedPlayers.map(([playerName, count], index) => (
            <div
              key={playerName}
              className={`flex justify-between items-center px-4 py-3 rounded-xl ${
                index === 0 && sortedPlayers.length > 1
                  ? "winner-card"
                  : "bg-[var(--background-tertiary)]"
              }`}
            >
              <span className="flex items-center gap-3">
                {index === 0 && sortedPlayers.length > 1 && (
                  <span className="trophy-shine text-xl">🏆</span>
                )}
                <span className="font-semibold">{playerName}</span>
              </span>
              <span className="text-xl font-bold text-[var(--accent)]">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="secondary-button flex-1 px-4 py-3 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={handleExport}
            className="secondary-button flex-1 px-4 py-3 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
        <Link
          href="/"
          className="glow-button block w-full text-center px-4 py-4 text-lg"
        >
          Play Again
        </Link>
      </div>
    </div>
  );
}
