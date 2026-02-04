import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const join = mutation({
  args: {
    gameId: v.id("games"),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if player already exists in this game
    const existing = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .filter((q) => q.eq(q.field("playerName"), args.playerName))
      .first();

    if (existing) {
      return existing._id;
    }

    // Add new player
    return await ctx.db.insert("players", {
      gameId: args.gameId,
      playerName: args.playerName,
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
