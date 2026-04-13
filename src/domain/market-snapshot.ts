import { z } from "zod";

const numericLike = z.union([z.number(), z.string()]).pipe(z.coerce.number());

export const rawMarketRowSchema = z
  .object({
    server: z.string().trim().min(1).optional(),
    market: z.string().trim().min(1).optional(),
    cereal: z.string().trim().min(1).optional(),
    symbol: z.string().trim().min(1).optional(),
    stock: numericLike.optional(),
    sales: numericLike.optional(),
    price: numericLike.optional(),
    capturedAt: z.string().trim().min(1).optional(),
    updatedAt: z.string().trim().min(1).optional(),
    date: z.string().trim().min(1).optional(),
  })
  .passthrough();

export type RawMarketRow = z.infer<typeof rawMarketRowSchema>;

export const normalizedEntrySchema = z.object({
  cereal: z.string().min(1),
  symbol: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().nonnegative(),
  sales: z.number().nonnegative(),
});

export type NormalizedEntry = z.infer<typeof normalizedEntrySchema>;

export const marketSnapshotSchema = z.object({
  server: z.string().min(1),
  snapshotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  snapshotKey: z.string().min(1),
  capturedAt: z.date(),
  source: z.literal("yoxo"),
  entries: z.array(normalizedEntrySchema),
  rawCount: z.number().int().positive(),
  ingestedAt: z.date(),
});

export type MarketSnapshot = z.infer<typeof marketSnapshotSchema>;

export const marketSnapshotDocumentSchema = marketSnapshotSchema.extend({
  _id: z.any().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MarketSnapshotDocument = z.infer<typeof marketSnapshotDocumentSchema>;

export type SyncResult = {
  fetchedRows: number;
  normalizedSnapshots: number;
  oddDayEligibleSnapshots: number;
  skippedSnapshots: number;
  upserted: number;
  matched: number;
  modified: number;
  oddDayOnly: true;
  syncAt: string;
};