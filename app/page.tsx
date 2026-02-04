"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DURATION_OPTIONS = [
  { minutes: 15, label: "15 min", description: "Quick" },
  { minutes: 30, label: "30 min", description: "Medium" },
  { minutes: 60, label: "1 hour", description: "Full" },
  { minutes: null, label: "Unlimited", description: "No timer" },
];

export default function Home() {
  const router = useRouter();
  const createGame = useMutation(api.games.create);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(30);

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
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Athlete Naming Game
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Challenge your friends to name as many athletes as possible!
        </p>

        {/* Duration Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Choose game duration:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.minutes ?? "unlimited"}
                onClick={() => setSelectedDuration(option.minutes)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedDuration === option.minutes
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs opacity-75">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCreateGame}
          disabled={isCreating}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isCreating ? "Creating..." : "Create Game"}
        </button>
        <p className="text-sm text-gray-500">
          Share the game link with friends, then start when ready
        </p>
      </div>
    </main>
  );
}
