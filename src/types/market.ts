export type ApiPriceHistory = Record<string, Record<string, number>>;

export type YoxoCerealMarketResponse = {
  data: {
    pricesTexture?: string;
    salesTexture?: string;
    stocksTexture?: string;
    pricesHistory: Record<string, Record<string, number>>;
    salesHistory: Record<string, Record<string, number>>;
    stocksHistory: Record<string, Record<string, number>>;
    cerealsPrice: Record<string, number>;
  };
  metadata: {
    server: string;
    date: string;
    timestamp: number;
    executionTimeMs?: number;
    dataType?: string;
  };
};

export type PricePoint = {
  date: string;
  value: number;
};

export type CropRecommendation = {
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  reason: string;
  reasons: string[];
  details: {
    pricePosition14d: number | null;
    weekOverWeekUsed: boolean;
    stockTrend: "up" | "down" | "flat";
    salesTrend: "up" | "down" | "flat";
    weekOverWeek: {
      priceAvgPercent: number | null;
      salesAvgPercent: number | null;
      stocksAvgPercent: number | null;
    };
    deltas: {
      price: { absolute: number | null; percent: number | null };
      sales: { absolute: number | null; percent: number | null };
      stocks: { absolute: number | null; percent: number | null };
    };
  };
};

export type CropMarketItem = {
  cropKey: string;
  cropLabel: string;
  cropImage?: string;
  currentPrice: number | null;
  priceHistory: PricePoint[];
  salesHistory: PricePoint[];
  stocksHistory: PricePoint[];
  recommendation: CropRecommendation;
};

export type MarketPageData = {
  server: string;
  snapshotDate: string;
  items: CropMarketItem[];
};