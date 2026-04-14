import { NextResponse } from "next/server";

import { syncLatestMarketSnapshot } from "@/application/market-snapshots";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOddUtcDay(date: Date) {
  return date.getUTCDate() % 2 === 1;
}

function isAuthorized(request: Request) {
  const env = getServerEnv();
  const provided = request.headers.get("authorization") ?? "";
  const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : "";
  return Boolean(expected) && provided === expected;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "1";
    const server = url.searchParams.get("server")?.trim() || undefined;
    const now = new Date();

    if (!force && !isOddUtcDay(now)) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "Jour pair UTC: snapshot sautee.",
      });
    }

    const { upsertResult, snapshot } = await syncLatestMarketSnapshot(server);

    return NextResponse.json({
      ok: true,
      skipped: false,
      inserted: upsertResult.inserted,
      server: upsertResult.server,
      snapshotDate: upsertResult.snapshotDate,
      payloadDate: snapshot.metadata.date,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Erreur inconnue pendant la synchronisation.",
      },
      { status: 500 }
    );
  }
}