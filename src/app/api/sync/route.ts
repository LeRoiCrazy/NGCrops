import { syncMarketSnapshots } from "@/application/sync-market-snapshots";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";

function getRequestSecret(request: Request) {
  const bearer = request.headers.get("authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim();
  }

  return request.headers.get("x-cron-secret")?.trim() ?? "";
}

export async function GET() {
  return Response.json({
    ok: true,
    route: "/api/sync",
    method: "POST",
    auth: "x-cron-secret or Authorization Bearer",
    oddDayOnly: true,
    idempotent: true,
  });
}

export async function POST(request: Request) {
  try {
    const env = getServerEnv();

    if (getRequestSecret(request) !== env.CRON_SECRET) {
      return Response.json({ ok: false, error: "Unauthorized." }, { status: 403 });
    }

    const result = await syncMarketSnapshots();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: "Sync failed.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}