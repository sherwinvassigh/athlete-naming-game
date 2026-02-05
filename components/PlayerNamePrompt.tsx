"use client";

import { useState } from "react";

interface PlayerNamePromptProps {
  onSubmit: (name: string) => void;
}

export function PlayerNamePrompt({ onSubmit }: PlayerNamePromptProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
      <div className="glass-card p-8 max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-3xl">👋</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Welcome!</h2>
        <p className="text-[var(--foreground-muted)] text-center mb-8">
          Enter your name to join the game
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name..."
            className="modern-input w-full px-4 py-4 text-lg text-center"
            maxLength={100}
            autoFocus
            autoCapitalize="words"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="glow-button w-full px-6 py-4 text-lg"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
