import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const MAX_NAME_LENGTH = 100;

/**
 * Normalize an athlete name for duplicate detection.
 * Trims whitespace, strips diacritics (é→e, ñ→n), and lowercases.
 */
export function normalizeAthleteName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const add = mutation({
  args: {
    gameId: v.id("games"),
    name: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate game exists and is active
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    if (!game.isActive) {
      throw new Error("This game has ended");
    }
    if (!game.startedAt) {
      throw new Error("Game hasn't started yet");
    }
    // Check if timed game has expired
    if (game.expiresAt && Date.now() > game.expiresAt) {
      throw new Error("Time's up! Game has ended");
    }

    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Please enter a name");
    }

    // Validate name length
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw new Error(`Name must be ${MAX_NAME_LENGTH} characters or less`);
    }

    // Validate player name
    const trimmedPlayerName = args.playerName.trim();
    if (!trimmedPlayerName) {
      throw new Error("Player name is required");
    }
    if (trimmedPlayerName.length > MAX_NAME_LENGTH) {
      throw new Error("Player name is too long");
    }

    const normalizedName = normalizeAthleteName(trimmedName);

    // Check for duplicate
    const existing = await ctx.db
      .query("athletes")
      .withIndex("by_game_and_name", (q) =>
        q.eq("gameId", args.gameId).eq("normalizedName", normalizedName)
      )
      .first();

    if (existing) {
      throw new Error(`"${existing.name}" has already been entered!`);
    }

    // Add the athlete
    await ctx.db.insert("athletes", {
      gameId: args.gameId,
      name: trimmedName,
      normalizedName,
      enteredAt: Date.now(),
      playerName: trimmedPlayerName,
    });

    return { success: true };
  },
});

export const listByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("athletes")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .collect();
  },
});
