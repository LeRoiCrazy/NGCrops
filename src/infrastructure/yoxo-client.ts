import { getServerEnv } from "@/lib/env";

import { rawMarketRowSchema, type RawMarketRow } from "@/domain/market-snapshot";

function resolveRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const map = payload as { data?: unknown; items?: unknown; rows?: unknown };
    if (Array.isArray(map.data)) return map.data;
    if (Array.isArray(map.items)) return map.items;
    if (Array.isArray(map.rows)) return map.rows;
  }

  throw new Error("Unexpected Yoxo response shape. Expected an array-like payload.");
}

function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase);
}

export class YoxoApiClient {
  async fetchGlobalCerealMarket(): Promise<RawMarketRow[]> {
    const env = getServerEnv();
    const url = joinUrl(env.YOXO_API_BASE_URL, env.YOXO_MARKET_PATH);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.YOXO_API_KEY}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Yoxo request failed (${response.status} ${response.statusText}).`
      );
    }

    const json = (await response.json()) as unknown;
    const rows = resolveRows(json);

    return rows.map((row) => rawMarketRowSchema.parse(row));
  }
}

export function createYoxoApiClient() {
  return new YoxoApiClient();
}