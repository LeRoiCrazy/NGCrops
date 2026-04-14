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
};

export type CropMarketItem = {
  cropKey: string;
  cropLabel: string;
  cropImage?: string;
  currentPrice: number | null;
  priceHistory: PricePoint[];
  recommendation: CropRecommendation;
};

export type MarketPageData = {
  server: string;
  snapshotDate: string;
  items: CropMarketItem[];
};