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

function toPercentDelta(current: number | null, previous: number | null) {
  if (current === null || previous === null || previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function normalizeTrendDirection(values: number[]) {
  if (values.length < 2) {
    return "flat" as const;
  }

  const first = values[0];
  const last = values[values.length - 1];
  const absolute = last - first;
  const percent = first === 0 ? 0 : (absolute / first) * 100;

  if (Math.abs(percent) < 2) {
    return "flat" as const;
  }

  return percent > 0 ? ("up" as const) : ("down" as const);
}

function describeTrend(direction: "up" | "down" | "flat", kind: "stocks" | "sales") {
  if (kind === "stocks") {
    if (direction === "up") return "Stocks en hausse recente (offre plus abondante)";
    if (direction === "down") return "Stocks en baisse recente (offre qui se tend)";
    return "Stocks globalement stables";
  }

  if (direction === "up") return "Ventes entreprises en hausse (pression baissiere)";
  if (direction === "down") return "Ventes entreprises en baisse (pression haussiere)";
  return "Ventes entreprises globalement stables";
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function computePricePosition14d(priceHistory: PricePoint[], currentPrice: number | null) {
  const window = priceHistory.slice(-14);
  const values = window.map((point) => point.value).filter(Number.isFinite);

  if (currentPrice === null || values.length < 2) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (max === min) {
    return 0.5;
  }

  return (currentPrice - min) / (max - min);
}

function computeWeekOverWeekPercent(series: PricePoint[]) {
  const window = series.slice(-14);
  if (window.length < 14) {
    return null;
  }

  const previousWeek = window.slice(0, 7).map((point) => point.value).filter(Number.isFinite);
  const currentWeek = window.slice(7).map((point) => point.value).filter(Number.isFinite);

  if (previousWeek.length < 7 || currentWeek.length < 7) {
    return null;
  }

  const previousAvg = previousWeek.reduce((sum, value) => sum + value, 0) / previousWeek.length;
  const currentAvg = currentWeek.reduce((sum, value) => sum + value, 0) / currentWeek.length;

  if (previousAvg === 0) {
    return null;
  }

  return ((currentAvg - previousAvg) / previousAvg) * 100;
}

function computeRecommendation(
  currentPrice: number | null,
  priceHistory: PricePoint[],
  salesHistory: PricePoint[],
  stocksHistory: PricePoint[],
  includePreviousWeekSignals: boolean
): CropRecommendation {
  if (currentPrice === null || priceHistory.length < 2) {
    return {
      signal: "HOLD",
      confidence: 50,
      reason: "Historique insuffisant pour conclure",
      reasons: ["Historique insuffisant pour conclure"],
      details: {
        pricePosition14d: null,
        weekOverWeekUsed: false,
        stockTrend: "flat",
        salesTrend: "flat",
        weekOverWeek: {
          priceAvgPercent: null,
          salesAvgPercent: null,
          stocksAvgPercent: null,
        },
        deltas: {
          price: { absolute: null, percent: null },
          sales: { absolute: null, percent: null },
          stocks: { absolute: null, percent: null },
        },
      },
    };
  }

  const values = priceHistory.map((point) => point.value).filter(Number.isFinite);

  if (values.length < 2) {
    return {
      signal: "HOLD",
      confidence: 50,
      reason: "Historique insuffisant pour conclure",
      reasons: ["Historique insuffisant pour conclure"],
      details: {
        pricePosition14d: null,
        weekOverWeekUsed: false,
        stockTrend: "flat",
        salesTrend: "flat",
        weekOverWeek: {
          priceAvgPercent: null,
          salesAvgPercent: null,
          stocksAvgPercent: null,
        },
        deltas: {
          price: { absolute: null, percent: null },
          sales: { absolute: null, percent: null },
          stocks: { absolute: null, percent: null },
        },
      },
    };
  }

  const pricePosition14d = computePricePosition14d(priceHistory, currentPrice);
  const stockValues = stocksHistory.slice(-14).map((point) => point.value).filter(Number.isFinite);
  const salesValues = salesHistory.slice(-14).map((point) => point.value).filter(Number.isFinite);
  const stockTrend = normalizeTrendDirection(stockValues);
  const salesTrend = normalizeTrendDirection(salesValues);

  const weekOverWeek = {
    priceAvgPercent: computeWeekOverWeekPercent(priceHistory),
    salesAvgPercent: computeWeekOverWeekPercent(salesHistory),
    stocksAvgPercent: computeWeekOverWeekPercent(stocksHistory),
  };

  const previousPrice = priceHistory.at(-2)?.value ?? null;
  const previousSales = salesHistory.at(-2)?.value ?? null;
  const previousStocks = stocksHistory.at(-2)?.value ?? null;
  const currentSales = salesHistory.at(-1)?.value ?? null;
  const currentStocks = stocksHistory.at(-1)?.value ?? null;

  const deltas = {
    price: {
      absolute:
        currentPrice !== null && previousPrice !== null
          ? currentPrice - previousPrice
          : null,
      percent: toPercentDelta(currentPrice, previousPrice),
    },
    sales: {
      absolute:
        currentSales !== null && previousSales !== null
          ? currentSales - previousSales
          : null,
      percent: toPercentDelta(currentSales, previousSales),
    },
    stocks: {
      absolute:
        currentStocks !== null && previousStocks !== null
          ? currentStocks - previousStocks
          : null,
      percent: toPercentDelta(currentStocks, previousStocks),
    },
  };

  let score = 0;

  if (pricePosition14d !== null) {
    if (pricePosition14d <= 0.33) score += 2;
    else if (pricePosition14d <= 0.45) score += 1;
    else if (pricePosition14d >= 0.66) score -= 2;
    else if (pricePosition14d >= 0.55) score -= 1;
  }

  // Regle metier: plus de ventes/stock = plus d'offre => pression baissiere du prix.
  if (stockTrend === "up") score -= 1;
  if (stockTrend === "down") score += 1;
  if (salesTrend === "up") score -= 1;
  if (salesTrend === "down") score += 1;

  if ((deltas.price.percent ?? 0) <= -4) score += 1;
  if ((deltas.price.percent ?? 0) >= 4) score -= 1;
  if ((deltas.sales.percent ?? 0) >= 4) score -= 1;
  if ((deltas.sales.percent ?? 0) <= -4) score += 1;
  if ((deltas.stocks.percent ?? 0) >= 4) score -= 1;
  if ((deltas.stocks.percent ?? 0) <= -4) score += 1;

  // Signal combine: quand ventes et stocks montent ensemble, la pression de l'offre est forte.
  if (salesTrend === "up" && stockTrend === "up") {
    score -= 1;
  }

  if (salesTrend === "down" && stockTrend === "down") {
    score += 1;
  }

  if (includePreviousWeekSignals) {
    if ((weekOverWeek.priceAvgPercent ?? 0) <= -3) score += 1;
    if ((weekOverWeek.priceAvgPercent ?? 0) >= 3) score -= 1;

    if ((weekOverWeek.salesAvgPercent ?? 0) >= 5) score -= 1;
    if ((weekOverWeek.salesAvgPercent ?? 0) <= -5) score += 1;

    if ((weekOverWeek.stocksAvgPercent ?? 0) >= 5) score -= 1;
    if ((weekOverWeek.stocksAvgPercent ?? 0) <= -5) score += 1;
  }

  const dataCompleteness =
    [priceHistory.length >= 2, salesHistory.length >= 2, stocksHistory.length >= 2].filter(Boolean)
      .length / 3;

  let signal: CropRecommendation["signal"] = "HOLD";
  if (score >= 3) {
    signal = "BUY";
  } else if (score <= -3) {
    signal = "SELL";
  }

  const reasons: string[] = [];

  if (pricePosition14d !== null) {
    reasons.push(
      `Position prix 14j: ${(pricePosition14d * 100).toFixed(0)}% du range recent`
    );
  } else {
    reasons.push("Position prix 14j indisponible (donnees insuffisantes)");
  }

  reasons.push(describeTrend(stockTrend, "stocks"));
  reasons.push(describeTrend(salesTrend, "sales"));
  reasons.push(
    `Delta snapshot: prix ${formatPercent(deltas.price.percent)}, ventes ${formatPercent(
      deltas.sales.percent
    )}, stocks ${formatPercent(deltas.stocks.percent)}`
  );

  if (includePreviousWeekSignals) {
    reasons.push(
      `Semaine N vs S-1: prix ${formatPercent(weekOverWeek.priceAvgPercent)}, ventes ${formatPercent(
        weekOverWeek.salesAvgPercent
      )}, stocks ${formatPercent(weekOverWeek.stocksAvgPercent)}`
    );
  } else {
    reasons.push("Comparaison semaine precedente ignoree (pas de snapshot S-1 en BDD)");
  }

  const baseConfidence = signal === "HOLD" ? 56 : 62;
  const confidence = clampConfidence(
    baseConfidence + Math.abs(score) * 7 + dataCompleteness * 12
  );

  const primaryReason = reasons[0] ?? "Signaux insuffisants";

  return {
    signal,
    confidence,
    reason: primaryReason,
    reasons,
    details: {
      pricePosition14d,
      weekOverWeekUsed: includePreviousWeekSignals,
      stockTrend,
      salesTrend,
      weekOverWeek,
      deltas,
    },
  };
}

function normalizePriceHistory(rawHistory: Record<string, number>) {
  return Object.entries(rawHistory)
    .map(([date, value]) => ({ date, value }))
    .filter((point) => Number.isFinite(point.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildCropMarketItems(
  payload: YoxoCerealMarketResponse,
  options?: { includePreviousWeekSignals?: boolean }
): CropMarketItem[] {
  const includePreviousWeekSignals = options?.includePreviousWeekSignals ?? false;

  const cropKeys = new Set<string>([
    ...Object.keys(payload.data.pricesHistory),
    ...Object.keys(payload.data.salesHistory),
    ...Object.keys(payload.data.stocksHistory),
    ...Object.keys(payload.data.cerealsPrice),
  ]);

  const items = Array.from(cropKeys).map((cropKey) => {
    const rawPriceHistory = payload.data.pricesHistory[cropKey] ?? {};
    const rawSalesHistory = payload.data.salesHistory[cropKey] ?? {};
    const rawStocksHistory = payload.data.stocksHistory[cropKey] ?? {};
    const priceHistory = normalizePriceHistory(rawPriceHistory);
    const salesHistory = normalizePriceHistory(rawSalesHistory);
    const stocksHistory = normalizePriceHistory(rawStocksHistory);
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
      salesHistory,
      stocksHistory,
      recommendation: computeRecommendation(
        currentPrice,
        priceHistory,
        salesHistory,
        stocksHistory,
        includePreviousWeekSignals
      ),
    } satisfies CropMarketItem;
  });

  return items.sort((a, b) => a.cropLabel.localeCompare(b.cropLabel, "fr"));
}