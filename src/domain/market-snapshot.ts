import type { YoxoCerealMarketResponse } from "@/types/market";

export type MarketSnapshotDocument = {
  _id?: string;
  server: string;
  snapshotDate: string;
  payload: YoxoCerealMarketResponse;
  source: "yoxo";
  createdAt: Date;
  updatedAt: Date;
};

export type SnapshotUpsertResult = {
  inserted: boolean;
  server: string;
  snapshotDate: string;
};
