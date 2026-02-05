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
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const prevFirstIdRef = useRef<string | null>(null);

  // Only highlight the single newest entry (first in list since sorted desc)
  useEffect(() => {
    if (athletes && athletes.length > 0) {
      const newestId = athletes[0]._id;

      // Only highlight if this is a new entry we haven't seen
      if (newestId !== prevFirstIdRef.current) {
        // Don't highlight on initial load
        if (prevFirstIdRef.current !== null) {
          setHighlightedId(newestId);

          // Clear highlight after animation
          const timer = setTimeout(() => {
            setHighlightedId(null);
          }, 1500);

          return () => clearTimeout(timer);
        }
        prevFirstIdRef.current = newestId;
      }
    }
  }, [athletes]);

  if (athletes === undefined) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-[var(--foreground-muted)]">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
          Athletes Named
        </h2>
        <span className="stat-value text-3xl">{athletes.length}</span>
      </div>

      {athletes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏃</div>
          <p className="text-[var(--foreground-subtle)]">
            No athletes yet. Start naming!
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {athletes.map((athlete) => (
            <li
              key={athlete._id}
              className={`list-item transition-all duration-500 ${
                highlightedId === athlete._id
                  ? "highlight-new"
                  : ""
              }`}
            >
              <span className="font-medium">{athlete.name}</span>
              <span className="text-xs text-[var(--foreground-subtle)] bg-[var(--background-tertiary)] px-2 py-1 rounded-full">
                {athlete.playerName || "Anonymous"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
