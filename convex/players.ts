import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_NAME_LENGTH = 100;

export const join = mutation({
  args: {
    gameId: v.id("games"),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate player name
    const trimmedName = args.playerName.trim();
    if (!trimmedName) {
      throw new Error("Player name is required");
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      throw new Error(`Player name must be ${MAX_NAME_LENGTH} characters or less`);
    }

    // Check if player already exists in this game
    const existing = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .filter((q) => q.eq(q.field("playerName"), trimmedName))
      .first();

    if (existing) {
      return existing._id;
    }

    // Add new player
    return await ctx.db.insert("players", {
      gameId: args.gameId,
      playerName: trimmedName,
      joinedAt: Date.now(),
    });
  },
});

export const listByGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});
