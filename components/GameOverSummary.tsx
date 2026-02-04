"use client";

import Link from "next/link";

interface Athlete {
  _id: string;
  name: string;
  playerName: string;
}

interface GameOverSummaryProps {
  athletes: Athlete[];
}

export function GameOverSummary({ athletes }: GameOverSummaryProps) {
  // Count athletes per player
  const playerCounts = athletes.reduce((acc, athlete) => {
    acc[athlete.playerName] = (acc[athlete.playerName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort players by count (highest first)
  const sortedPlayers = Object.entries(playerCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-md w-full">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
        Time's Up!
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

      <Link
        href="/"
        className="block w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Start New Game
      </Link>
    </div>
  );
}
