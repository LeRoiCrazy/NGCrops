import { NextResponse } from "next/server";

import { getLatestMarketSnapshot } from "@/application/market-snapshots";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MAX_AGE_HOURS = 72;

function isAuthorized(request: Request) {
  const env = getServerEnv();
  const provided = request.headers.get("authorization") ?? "";
  const expected = env.CRON_SECRET ? `Bearer ${env.CRON_SECRET}` : "";
  return Boolean(expected) && provided === expected;
}

function parseMaxAgeHours(rawValue: string | null) {
  if (!rawValue) {
    return DEFAULT_MAX_AGE_HOURS;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_AGE_HOURS;
  }

  return parsed;
}

export async function GET(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const env = getServerEnv();
    const url = new URL(request.url);
    const server =
      url.searchParams.get("server")?.trim() || env.NEXT_PUBLIC_DEFAULT_SERVER;
    const maxAgeHours = parseMaxAgeHours(url.searchParams.get("maxAgeHours"));

    const snapshot = await getLatestMarketSnapshot(server);

    if (!snapshot) {
      return NextResponse.json(
        {
          ok: false,
          healthy: false,
          stale: true,
          reason: "Aucune snapshot trouvee pour ce serveur.",
          server,
        },
        { status: 503 }
      );
    }

    const now = Date.now();
    const updatedAtMs = new Date(snapshot.updatedAt).getTime();
    const ageHours = (now - updatedAtMs) / (1000 * 60 * 60);
    const stale = ageHours > maxAgeHours;

    return NextResponse.json(
      {
        ok: true,
        healthy: !stale,
        stale,
        server: snapshot.server,
        snapshotDate: snapshot.snapshotDate,
        updatedAt: snapshot.updatedAt,
        ageHours: Number(ageHours.toFixed(2)),
        maxAgeHours,
      },
      { status: stale ? 503 : 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        healthy: false,
        message:
          error instanceof Error
            ? error.message
            : "Erreur inconnue pendant le health check.",
      },
      { status: 500 }
    );
  }
}