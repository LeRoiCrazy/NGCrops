import {
  marketSnapshotSchema,
  type MarketSnapshot,
  type RawMarketRow,
} from "@/domain/market-snapshot";

function parseDateFromRow(row: RawMarketRow) {
  const raw = row.capturedAt ?? row.updatedAt ?? row.date;
  const parsed = raw ? new Date(raw) : new Date();

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid snapshot date in Yoxo payload.");
  }

  return parsed;
}

function toSnapshotDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function snapshotKey(server: string, snapshotDate: string) {
  return `${server}::${snapshotDate}`;
}

export function isOddDay(snapshotDate: string) {
  const day = Number.parseInt(snapshotDate.slice(8, 10), 10);
  return day % 2 === 1;
}

export function normalizeMarketRows(rows: readonly RawMarketRow[]): MarketSnapshot[] {
  const grouped = new Map<string, MarketSnapshot>();

  for (const row of rows) {
    const capturedAt = parseDateFromRow(row);
    const server = (row.server ?? row.market ?? "global").trim().toLowerCase();
    const snapshotDate = toSnapshotDate(capturedAt);
    const key = snapshotKey(server, snapshotDate);

    const entry = {
      cereal: row.cereal ?? row.symbol ?? "unknown",
      symbol: row.symbol ?? row.cereal ?? "unknown",
      price: row.price ?? 0,
      stock: row.stock ?? 0,
      sales: row.sales ?? 0,
    };

    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(
        key,
        marketSnapshotSchema.parse({
          server,
          snapshotDate,
          snapshotKey: key,
          capturedAt,
          source: "yoxo",
          entries: [entry],
          rawCount: 1,
          ingestedAt: new Date(),
        })
      );
      continue;
    }

    existing.entries.push(entry);
    existing.rawCount += 1;
    if (capturedAt > existing.capturedAt) {
      existing.capturedAt = capturedAt;
    }
  }

  return Array.from(grouped.values());
}