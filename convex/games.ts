import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const CLEANUP_DELAY_MS = 60 * 60 * 1000; // 1 hour

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

    // Idempotent — if already ended, don't re-schedule cleanup
    if (!game.isActive) {
      return;
    }

    // Set expiresAt to now to end the game immediately
    await ctx.db.patch(args.gameId, {
      expiresAt: Date.now(),
      isActive: false,
    });

    // Schedule cleanup of all game data after 1 hour
    await ctx.scheduler.runAfter(
      CLEANUP_DELAY_MS,
      internal.games.deleteGameData,
      { gameId: args.gameId }
    );
  },
});

export const get = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

/**
 * Internal mutation: deletes all data for a game (athletes, players, game record).
 * Scheduled to run 1 hour after a game ends so players can view results first.
 */
export const deleteGameData = internalMutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // Delete all athletes for this game
    const athletes = await ctx.db
      .query("athletes")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const athlete of athletes) {
      await ctx.db.delete(athlete._id);
    }

    // Delete all players for this game
    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    // Delete the game record itself
    const game = await ctx.db.get(args.gameId);
    if (game) {
      await ctx.db.delete(args.gameId);
    }
  },
});
