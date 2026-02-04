"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const createGame = useMutation(api.games.create);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const gameId = await createGame();
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
          Challenge your friends to name as many athletes as possible in one hour!
        </p>
        <button
          onClick={handleCreateGame}
          disabled={isCreating}
          className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          {isCreating ? "Creating..." : "Start New Game"}
        </button>
        <p className="text-sm text-gray-500">
          Share the game link with friends to play together
        </p>
      </div>
    </main>
  );
}
