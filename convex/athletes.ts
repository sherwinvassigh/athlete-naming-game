import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    gameId: v.id("games"),
    name: v.string(),
    playerName: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmedName = args.name.trim();
    if (!trimmedName) {
      throw new Error("Please enter a name");
    }

    const normalizedName = trimmedName.toLowerCase();

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
      playerName: args.playerName,
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
