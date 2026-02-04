import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    durationMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const durationMs = args.durationMinutes * 60 * 1000;
    const gameId = await ctx.db.insert("games", {
      createdAt: now,
      expiresAt: now + durationMs,
      durationMinutes: args.durationMinutes,
      isActive: true,
    });
    return gameId;
  },
});

export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});
