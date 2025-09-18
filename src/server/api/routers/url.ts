import { sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { urls } from "~/server/db/schema";

export const urlRouter = createTRPCRouter({
  // Create a shortened URL. If an id isn't provided, assign next sequential id starting from 0.
  shorten: publicProcedure
    .input(
      z.object({
        originalUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find current max id; start from -1 so first becomes 0
      const result = await ctx.db
        .select({ maxId: sql<number>`coalesce(max(${urls.id}), -1)` })
        .from(urls);

      const nextId = (result[0]?.maxId ?? -1) + 1;

      await ctx.db.insert(urls).values({
        id: nextId,
        originalUrl: input.originalUrl,
      });

      return { id: nextId };
    }),

  // Get recent shortened URLs (latest first)
  getRecent: publicProcedure
    .input(
      z.object({ limit: z.number().min(1).max(50).default(10) }).optional(),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const rows = await ctx.db.query.urls.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit,
      });

      return rows;
    }),

  // Resolve id to original URL
  getById: publicProcedure
    .input(z.object({ id: z.number().int().nonnegative() }))
    .query(async ({ ctx, input }) => {
      const row = await ctx.db.query.urls.findFirst({
        where: (t, { eq }) => eq(t.id, input.id),
      });
      return row ?? null;
    }),
});
