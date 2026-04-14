import { getCropDisplayConfig } from "@/lib/crops";
import type {
  CropMarketItem,
  CropRecommendation,
  PricePoint,
  YoxoCerealMarketResponse,
} from "@/types/market";

function clampConfidence(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function computeRecommendation(
  currentPrice: number | null,
  priceHistory: PricePoint[]
): CropRecommendation {
  if (currentPrice === null || priceHistory.length < 2) {
    return {
      signal: "HOLD",
      confidence: 50,
      reason: "Historique insuffisant pour conclure",
    };
  }

  const values = priceHistory.map((point) => point.value).filter(Number.isFinite);

  if (values.length < 2) {
    return {
      signal: "HOLD",
      confidence: 50,
      reason: "Historique insuffisant pour conclure",
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return {
      signal: "HOLD",
      confidence: 55,
      reason: "Prix stable sur la periode recente",
    };
  }

  const position = (currentPrice - min) / (max - min);

  if (position <= 0.33) {
    return {
      signal: "BUY",
      confidence: clampConfidence((1 - position) * 100),
      reason: "Prix proche du plus bas recent",
    };
  }

  if (position >= 0.66) {
    return {
      signal: "SELL",
      confidence: clampConfidence(position * 100),
      reason: "Prix proche du plus haut recent",
    };
  }

  return {
    signal: "HOLD",
    confidence: clampConfidence(60 - Math.abs(position - 0.5) * 40),
    reason: "Prix situe dans une zone intermediaire",
  };
}

function normalizePriceHistory(rawHistory: Record<string, number>) {
  return Object.entries(rawHistory)
    .map(([date, value]) => ({ date, value }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildCropMarketItems(
  payload: YoxoCerealMarketResponse
): CropMarketItem[] {
  const cropKeys = new Set<string>([
    ...Object.keys(payload.data.pricesHistory),
    ...Object.keys(payload.data.cerealsPrice),
  ]);

  const items = Array.from(cropKeys).map((cropKey) => {
    const rawHistory = payload.data.pricesHistory[cropKey] ?? {};
    const priceHistory = normalizePriceHistory(rawHistory);
    const currentPrice =
      payload.data.cerealsPrice[cropKey] ??
      priceHistory.at(-1)?.value ??
      null;
    const display = getCropDisplayConfig(cropKey);

    return {
      cropKey,
      cropLabel: display.label,
      cropImage: display.image,
      currentPrice,
      priceHistory,
      recommendation: computeRecommendation(currentPrice, priceHistory),
    } satisfies CropMarketItem;
  });

  return items.sort((a, b) => a.cropLabel.localeCompare(b.cropLabel, "fr"));
}