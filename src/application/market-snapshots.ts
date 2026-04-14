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

function formatIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function hasPreviousWeekSnapshot(
  server: string,
  latestSnapshotDate: string
) {
  const collection = await getMarketSnapshotsCollection();
  const anchor = new Date(`${latestSnapshotDate}T00:00:00.000Z`);

  if (Number.isNaN(anchor.getTime())) {
    return false;
  }

  const minDate = new Date(anchor.getTime() - 14 * 24 * 60 * 60 * 1000);
  const maxDate = new Date(anchor.getTime() - 6 * 24 * 60 * 60 * 1000);

  const existing = await collection.findOne({
    server,
    snapshotDate: {
      $gte: formatIsoDate(minDate),
      $lte: formatIsoDate(maxDate),
    },
  });

  return Boolean(existing);
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
