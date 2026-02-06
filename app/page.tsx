"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const SPORTS_EMOJIS = ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏓", "🏒", "🥊", "🏋️"];

const DURATION_OPTIONS = [
  { minutes: 15, label: "15 min", description: "Quick" },
  { minutes: 30, label: "30 min", description: "Standard" },
  { minutes: 60, label: "1 hour", description: "Marathon" },
  { minutes: null, label: "∞", description: "No limit" },
];

export default function Home() {
  const router = useRouter();
  const createGame = useMutation(api.games.create);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(30);
  const [emojiIndex, setEmojiIndex] = useState(0);

  // Cycle through sports emojis
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % SPORTS_EMOJIS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const gameId = await createGame({
        durationMinutes: selectedDuration ?? undefined
      });
      router.push(`/game/${gameId}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 text-center space-y-10 max-w-lg w-full">
        {/* Logo/Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 mb-4">
            <span
              key={emojiIndex}
              className="text-3xl inline-block animate-emoji-pop"
            >
              {SPORTS_EMOJIS[emojiIndex]}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text">
            Athlete Naming Game
          </h1>
          <p className="text-[var(--foreground-muted)] text-lg">
            Challenge your friends to name as many athletes as possible
          </p>
        </div>

        {/* Duration Selection */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--foreground-muted)]">
              Game Duration
            </span>
            <span className="text-xs text-[var(--foreground-subtle)]">
              Select one
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.minutes ?? "unlimited"}
                onClick={() => setSelectedDuration(option.minutes)}
                className={`relative p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-between h-[72px] ${
                  selectedDuration === option.minutes
                    ? "bg-[var(--accent)] text-white shadow-lg shadow-blue-500/25"
                    : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                <div className="text-lg font-bold leading-tight">{option.label}</div>
                <div className={`text-xs ${
                  selectedDuration === option.minutes
                    ? "text-blue-100"
                    : "text-[var(--foreground-subtle)]"
                }`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create Button */}
        <div className="space-y-4">
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="glow-button w-full px-8 py-4 text-lg"
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Game"
            )}
          </button>

          <p className="text-sm text-[var(--foreground-subtle)]">
            Share the link with friends, then start when everyone&apos;s ready
          </p>
        </div>
      </div>
    </main>
  );
}
