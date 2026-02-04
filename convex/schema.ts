import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    durationMinutes: v.optional(v.number()), // null = unlimited
    isActive: v.boolean(),
  }),

  athletes: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    normalizedName: v.string(),
    enteredAt: v.number(),
    playerName: v.optional(v.string()),
  })
    .index("by_game", ["gameId"])
    .index("by_game_and_name", ["gameId", "normalizedName"]),

  players: defineTable({
    gameId: v.id("games"),
    playerName: v.string(),
    joinedAt: v.number(),
  })
    .index("by_game", ["gameId"]),
});
