import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ONE_HOUR_MS = 60 * 60 * 1000;

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const gameId = await ctx.db.insert("games", {
      createdAt: now,
      expiresAt: now + ONE_HOUR_MS,
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
