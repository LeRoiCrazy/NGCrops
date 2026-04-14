import { z } from "zod";

import { getOddDateCandidates } from "@/lib/date";
import type { YoxoCerealMarketResponse } from "@/types/market";

const marketResponseSchema: z.ZodType<YoxoCerealMarketResponse> = z.object({
  data: z.object({
    pricesTexture: z.string().optional(),
    salesTexture: z.string().optional(),
    stocksTexture: z.string().optional(),
    pricesHistory: z.record(z.string(), z.record(z.string(), z.number())),
    salesHistory: z.record(z.string(), z.record(z.string(), z.number())),
    stocksHistory: z.record(z.string(), z.record(z.string(), z.number())),
    cerealsPrice: z.record(z.string(), z.number()),
  }),
  metadata: z.object({
    server: z.string(),
    date: z.string(),
    timestamp: z.number(),
    executionTimeMs: z.number().optional(),
    dataType: z.string().optional(),
  }),
});

function requireEnv(name: "YOXO_API_BASE_URL" | "YOXO_CLIENT_ID" | "YOXO_CLIENT_SECRET") {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }

  return value;
}

async function fetchOAuthAccessToken(clientId: string, clientSecret: string) {
  const tokenUrl = "https://auth.yoxo.software/oauth2/token";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "api_access",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Echec OAuth Yoxo (${response.status} ${response.statusText}). Verifiez YOXO_CLIENT_ID/YOXO_CLIENT_SECRET.`
    );
  }

  const tokenPayload = (await response.json()) as { access_token?: string };
  if (!tokenPayload.access_token) {
    throw new Error("Reponse OAuth Yoxo invalide: access_token manquant.");
  }

  return tokenPayload.access_token;
}

function normalizeMarketBaseUrl(baseUrl: string) {
  // Docs/current examples use api.yoxo.software for market endpoints.
  if (baseUrl.startsWith("https://www.yoxo.software/api")) {
    return "https://api.yoxo.software";
  }

  return baseUrl;
}

function buildMarketUrl(baseUrl: string, date: string, javaServer: string) {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const path = `v2/java/cereal_global_market/${date}/${javaServer}`;
  return new URL(path, normalizedBaseUrl);
}

export async function fetchYoxoCerealMarket(javaServer = "mocha") {
  const baseUrl = normalizeMarketBaseUrl(requireEnv("YOXO_API_BASE_URL"));
  const clientId = requireEnv("YOXO_CLIENT_ID");
  const clientSecret = requireEnv("YOXO_CLIENT_SECRET");
  const accessToken = await fetchOAuthAccessToken(clientId, clientSecret);

  const datesToTry = getOddDateCandidates(new Date(), 12);
  let lastStatus: { code: number; text: string } | null = null;

  for (const date of datesToTry) {
    const url = buildMarketUrl(baseUrl, date, javaServer);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = await response.json();
      return marketResponseSchema.parse(payload);
    }

    lastStatus = { code: response.status, text: response.statusText };

    // 404 means snapshot not available for this odd day yet: continue with previous odd date.
    if (response.status === 404) {
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Echec d'authentification Yoxo (401/403). Verifiez le flux OAuth2 (token) et les permissions de votre client sur cereal_global_market."
      );
    }

    throw new Error(
      `Echec de l'appel Yoxo (${response.status} ${response.statusText}).`
    );
  }

  throw new Error(
    lastStatus
      ? `Aucun snapshot impair disponible (${lastStatus.code} ${lastStatus.text}).`
      : "Aucun snapshot impair disponible pour le serveur demande."
  );
}