"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AthleteListProps {
  gameId: Id<"games">;
}

export function AthleteList({ gameId }: AthleteListProps) {
  const athletes = useQuery(api.athletes.listByGame, { gameId });

  if (athletes === undefined) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Athletes Named</h2>
        <span className="text-2xl font-bold text-blue-600">{athletes.length}</span>
      </div>

      {athletes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No athletes yet. Start naming!
        </p>
      ) : (
        <ul className="space-y-1 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {athletes.map((athlete) => (
            <li
              key={athlete._id}
              className="px-3 py-2 bg-gray-50 rounded hover:bg-gray-100 flex justify-between items-center"
            >
              <span>{athlete.name}</span>
              <span className="text-xs text-gray-400">{athlete.playerName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
