import {
  type MarketSnapshotDocument,
  type SyncResult,
} from "@/domain/market-snapshot";
import { getMongoCollection } from "@/infrastructure/mongodb";
import { createYoxoApiClient } from "@/infrastructure/yoxo-client";

import { isOddDay, normalizeMarketRows } from "./normalize-market-snapshots";

const SNAPSHOT_COLLECTION = "market_snapshots";

async function ensureIndexes() {
  const collection = await getMongoCollection<MarketSnapshotDocument>(
    SNAPSHOT_COLLECTION
  );
  await collection.createIndex({ snapshotKey: 1 }, { unique: true });
  await collection.createIndex({ server: 1, snapshotDate: -1 });
  return collection;
}

export async function syncMarketSnapshots(): Promise<SyncResult> {
  const client = createYoxoApiClient();
  const rows = await client.fetchGlobalCerealMarket();
  const normalized = normalizeMarketRows(rows);
  const eligible = normalized.filter((snapshot) => isOddDay(snapshot.snapshotDate));
  const now = new Date();

  const collection = await ensureIndexes();

  if (eligible.length === 0) {
    return {
      fetchedRows: rows.length,
      normalizedSnapshots: normalized.length,
      oddDayEligibleSnapshots: 0,
      skippedSnapshots: normalized.length,
      upserted: 0,
      matched: 0,
      modified: 0,
      oddDayOnly: true,
      syncAt: now.toISOString(),
    };
  }

  const operations = eligible.map((snapshot) => ({
    updateOne: {
      filter: { snapshotKey: snapshot.snapshotKey },
      update: {
        $set: {
          ...snapshot,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations, { ordered: false });

  return {
    fetchedRows: rows.length,
    normalizedSnapshots: normalized.length,
    oddDayEligibleSnapshots: eligible.length,
    skippedSnapshots: normalized.length - eligible.length,
    upserted: result.upsertedCount,
    matched: result.matchedCount,
    modified: result.modifiedCount,
    oddDayOnly: true,
    syncAt: now.toISOString(),
  };
}