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

  // Share results (native share or copy to clipboard)
  const handleShare = async () => {
    const text = `Athlete Naming Game Results!\n\nWe named ${athletes.length} athletes!\n\n${sortedPlayers.map(([name, count], i) => `${i === 0 && sortedPlayers.length > 1 ? "🏆 " : ""}${name}: ${count}`).join("\n")}`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 w-full">
      {/* Screenshot-friendly header section */}
      <div className="text-center pb-4 border-b border-gray-100 mb-4">
        <div className="text-4xl mb-2">🏆</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Game Complete!
        </h2>
        <div className="text-6xl font-bold text-blue-600 my-3">
          {athletes.length}
        </div>
        <p className="text-gray-500 font-medium">athletes named</p>
      </div>

      {/* Player breakdown - prominent for screenshots */}
      {sortedPlayers.length > 0 && (
        <div className="mb-4">
          <ul className="space-y-2">
            {sortedPlayers.map(([playerName, count], index) => (
              <li
                key={playerName}
                className={`flex justify-between items-center px-4 py-3 rounded-xl ${
                  index === 0 && sortedPlayers.length > 1
                    ? "bg-yellow-50 border-2 border-yellow-200"
                    : "bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  {index === 0 && sortedPlayers.length > 1 && (
                    <span className="text-xl">🏆</span>
                  )}
                  <span className="font-semibold text-gray-900">{playerName}</span>
                </span>
                <span className="text-xl font-bold text-blue-600">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2 pt-2">
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Share
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Export
          </button>
        </div>
        <Link
          href="/"
          className="block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Play Again
        </Link>
      </div>
    </div>
  );
}
