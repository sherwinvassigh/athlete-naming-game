"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AthleteListProps {
  gameId: Id<"games">;
}

export function AthleteList({ gameId }: AthleteListProps) {
  const athletes = useQuery(api.athletes.listByGame, { gameId });
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevCountRef = useRef<number>(0);

  // Track new entries and highlight them
  useEffect(() => {
    if (athletes && athletes.length > prevCountRef.current) {
      // Find new entries (they're at the start since sorted desc)
      const numNew = athletes.length - prevCountRef.current;
      const newEntryIds = athletes.slice(0, numNew).map((a) => a._id);

      setNewIds(new Set(newEntryIds));

      // Clear highlight after animation
      const timer = setTimeout(() => {
        setNewIds(new Set());
      }, 1500);

      return () => clearTimeout(timer);
    }
    prevCountRef.current = athletes?.length ?? 0;
  }, [athletes]);

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
        <ul className="space-y-1 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-2">
          {athletes.map((athlete) => (
            <li
              key={athlete._id}
              className={`px-3 py-2 rounded flex justify-between items-center transition-all duration-500 ${
                newIds.has(athlete._id)
                  ? "bg-green-100 border-l-4 border-green-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">{athlete.name}</span>
              <span className="text-xs text-gray-400">{athlete.playerName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
