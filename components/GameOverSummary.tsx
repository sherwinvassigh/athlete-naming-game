"use client";

import { useEffect } from "react";
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
  // Trigger confetti on mount
  useEffect(() => {
    // Fire confetti from both sides
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
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

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Big burst in the middle
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
      });
    }, 500);
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

    // Create and download file
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

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-md w-full">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
        🎉 Time's Up! 🎉
      </h2>
      <p className="text-center text-5xl font-bold text-blue-600 mb-6">
        {athletes.length} <span className="text-lg font-normal text-gray-500">athletes named</span>
      </p>

      {sortedPlayers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Breakdown by Player
          </h3>
          <ul className="space-y-2">
            {sortedPlayers.map(([playerName, count], index) => (
              <li
                key={playerName}
                className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  {index === 0 && sortedPlayers.length > 1 && (
                    <span className="text-yellow-500">🏆</span>
                  )}
                  <span className="font-medium">{playerName}</span>
                </span>
                <span className="text-blue-600 font-bold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleExport}
          className="block w-full text-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Export Results
        </button>
        <Link
          href="/"
          className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start New Game
        </Link>
      </div>
    </div>
  );
}
