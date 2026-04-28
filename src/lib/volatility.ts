import type { CropMarketItem, PricePoint } from "@/types/market";
import { filterPriceHistoryByRange } from "@/lib/market";
import type { MarketChartRange } from "@/lib/market";

export interface VolatilityItem {
  cropKey: string;
  cropLabel: string;
  volatility: number; // percentage
  priceMin: number;
  priceMax: number;
  priceAvg: number;
}

/**
 * Calculate volatility for a single crop based on price history.
 * Volatility = (max - min) / average * 100 (percentage amplitude)
 */
function calculateCropVolatility(
  priceHistory: PricePoint[],
): number {
  if (priceHistory.length === 0) return 0;

  const prices = priceHistory.map((h) => h.value);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

  if (avg === 0) return 0;
  return ((max - min) / avg) * 100;
}

/**
 * Get top N volatile crops for a given range and items
 */
export function getTopVolatileCrops(
  items: CropMarketItem[],
  range: MarketChartRange,
  limit: number = 5,
): VolatilityItem[] {
  const volatilities: VolatilityItem[] = items
    .map((item) => {
      const filteredHistory = filterPriceHistoryByRange(item.priceHistory || [], range);
      const volatility = calculateCropVolatility(filteredHistory);
      
      const prices = filteredHistory.map((h) => h.value);
      const priceMin = prices.length > 0 ? Math.min(...prices) : 0;
      const priceMax = prices.length > 0 ? Math.max(...prices) : 0;
      const priceAvg = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      return {
        cropKey: item.cropKey,
        cropLabel: item.cropLabel || item.cropKey,
        volatility,
        priceMin,
        priceMax,
        priceAvg,
      };
    })
    .sort((a, b) => b.volatility - a.volatility)
    .slice(0, limit);

  return volatilities;
}
