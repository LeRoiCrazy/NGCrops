"use client";

import { useState, useMemo } from "react";

import { CropCard } from "@/components/market/crop-card";
import { MultiCropPriceChart } from "@/components/market/multi-crop-price-chart";
import { TopVolatiles } from "@/components/market/top-volatiles";
import { CropFilter } from "@/components/market/crop-filter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MarketChartRange } from "@/lib/market";
import type { CropMarketItem } from "@/types/market";

type MarketTabsProps = {
  server: string;
  snapshotDate: string;
  source: "mongodb" | "yoxo";
  items: CropMarketItem[];
};

const RANGE_OPTIONS: Array<{ value: MarketChartRange; label: string }> = [
  { value: "7", label: "7 jours" },
  { value: "14", label: "14 jours" },
  { value: "30", label: "30 jours" },
  { value: "all", label: "Toute la periode" },
];

export function MarketTabs({ server, snapshotDate, source, items }: MarketTabsProps) {
  const [range, setRange] = useState<MarketChartRange>("14");
  const [selectedCrops, setSelectedCrops] = useState<string[]>(
    items.map((item) => item.cropKey),
  );

  // Filter items based on selected crops
  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        selectedCrops.includes(item.cropKey),
      ),
    [items, selectedCrops],
  );

  return (
    <>
      <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>NGCrops</Badge>
          <Badge variant="outline">Serveur: {server}</Badge>
          <Badge variant="secondary">Snapshot: {snapshotDate}</Badge>
          <Badge variant="outline">Source: {source === "mongodb" ? "MongoDB" : "Yoxo live"}</Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Marche global des cereals</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vue cartes et vue graphique consolidee avec une courbe par cereale.
        </p>
      </section>

      <Tabs defaultValue="cards" className="w-full gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="cards">Vue cartes</TabsTrigger>
            <TabsTrigger value="graph">Vue graphique</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Periode</span>
            <Select value={range} onValueChange={(value) => setRange(value as MarketChartRange)}>
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <CropFilter items={items} selectedCrops={selectedCrops} onSelectionChange={setSelectedCrops} />
          </div>
        </div>

        <TabsContent value="cards">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <CropCard key={item.cropKey} item={item} range={range} />
            ))}
          </section>
        </TabsContent>

        <TabsContent value="graph" className="space-y-4">
          <Card className="bg-card/60">
            <CardContent className="pt-6">
              <p className="mb-4 text-sm text-muted-foreground">
                Chaque courbe represente l&apos;evolution du prix d&apos;une cereale sur la meme timeline.
              </p>
              <MultiCropPriceChart items={filteredItems} range={range} />
            </CardContent>
          </Card>

          <TopVolatiles items={filteredItems} range={range} />
        </TabsContent>
      </Tabs>
    </>
  );
}
