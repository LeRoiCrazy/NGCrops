import type { Filter } from "mongodb";

import type {
  MarketSnapshotDocument,
  SnapshotUpsertResult,
} from "@/domain/market-snapshot";
import { getServerEnv } from "@/lib/env";
import { fetchYoxoCerealMarket } from "@/lib/yoxo";
import { getMongoCollection } from "@/infrastructure/mongodb";

const SNAPSHOT_COLLECTION = "market_snapshots";

let indexesReadyPromise: Promise<void> | null = null;

async function getMarketSnapshotsCollection() {
  const collection = await getMongoCollection<MarketSnapshotDocument>(
    SNAPSHOT_COLLECTION
  );

  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      await collection.createIndex(
        { server: 1, snapshotDate: 1 },
        { unique: true, name: "uniq_server_snapshot_date" }
      );
      await collection.createIndex(
        { server: 1, snapshotDate: -1, updatedAt: -1 },
        { name: "latest_snapshot_by_server" }
      );
    })();
  }

  await indexesReadyPromise;
  return collection;
}

export async function getLatestMarketSnapshot(server: string) {
  const collection = await getMarketSnapshotsCollection();

  return collection.findOne(
    { server },
    {
      sort: { snapshotDate: -1, updatedAt: -1 },
    }
  );
}

export async function upsertMarketSnapshot(
  payload: MarketSnapshotDocument
): Promise<SnapshotUpsertResult> {
  const collection = await getMarketSnapshotsCollection();
  const now = new Date();
  const filter: Filter<MarketSnapshotDocument> = {
    server: payload.server,
    snapshotDate: payload.snapshotDate,
  };

  const updateResult = await collection.updateOne(filter, {
    $set: {
      payload: payload.payload,
      source: "yoxo",
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
      server: payload.server,
      snapshotDate: payload.snapshotDate,
    },
  },
  { upsert: true });

  return {
    inserted: Boolean(updateResult.upsertedId),
    server: payload.server,
    snapshotDate: payload.snapshotDate,
  };
}

export async function syncLatestMarketSnapshot(inputServer?: string) {
  const defaultServer = getServerEnv().NEXT_PUBLIC_DEFAULT_SERVER;
  const server = inputServer ?? defaultServer;

  const marketResponse = await fetchYoxoCerealMarket(server);
  const snapshotDate = marketResponse.metadata.date;

  const upsertResult = await upsertMarketSnapshot({
    server: marketResponse.metadata.server,
    snapshotDate,
    payload: marketResponse,
    source: "yoxo",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    upsertResult,
    snapshot: marketResponse,
  };
}
