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
      // Re-focus input after successful add
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add athlete");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
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
          className="modern-input flex-1 px-4 py-4 text-lg"
          autoFocus
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="send"
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting || !name.trim()}
          className="glow-button px-6 py-4 text-lg min-w-[80px]"
        >
          {isSubmitting ? (
            <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            "Add"
          )}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </form>
  );
}
