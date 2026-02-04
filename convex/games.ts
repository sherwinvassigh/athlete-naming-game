import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    durationMinutes: v.optional(v.number()), // null = unlimited
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const gameId = await ctx.db.insert("games", {
      createdAt: now,
      startedAt: undefined,
      expiresAt: undefined,
      durationMinutes: args.durationMinutes,
      isActive: true,
    });
    return gameId;
  },
});

export const start = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    if (game.startedAt) {
      // Already started, no-op
      return;
    }

    const now = Date.now();
    const durationMs = game.durationMinutes
      ? game.durationMinutes * 60 * 1000
      : null;

    await ctx.db.patch(args.gameId, {
      startedAt: now,
      expiresAt: durationMs ? now + durationMs : undefined,
    });
  },
});

export const end = mutation({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    // Set expiresAt to now to end the game immediately
    await ctx.db.patch(args.gameId, {
      expiresAt: Date.now(),
      isActive: false,
    });
  },
});

export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});
