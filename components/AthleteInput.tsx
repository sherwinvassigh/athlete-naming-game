"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface AthleteInputProps {
  gameId: Id<"games">;
  playerName: string;
  disabled?: boolean;
}

export function AthleteInput({ gameId, playerName, disabled }: AthleteInputProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addAthlete = useMutation(api.athletes.add);

  // Keep input focused on mount
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting || disabled) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await addAthlete({ gameId, name: name.trim(), playerName });
      setName("");
      // Re-focus input after successful add - keeps keyboard open on mobile
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add athlete");
      // Also re-focus on error so user can correct
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="Enter athlete name..."
          disabled={disabled || isSubmitting}
          className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoFocus
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="send"
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting || !name.trim()}
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "..." : "Add"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-500 text-sm">{error}</p>
      )}
    </form>
  );
}
