"use client";

import { getTopVolatileCrops } from "@/lib/volatility";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CropMarketItem } from "@/types/market";
import type { MarketChartRange } from "@/lib/market";

type TopVolatilesProps = {
  items: CropMarketItem[];
  range: MarketChartRange;
};

export function TopVolatiles({ items, range }: TopVolatilesProps) {
  const volatiles = getTopVolatileCrops(items, range, 5);

  return (
    <Card className="bg-card/60 border-amber-400/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-500">
          <span>⚡ Top 5 Volatiles</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {volatiles.map((item, index) => (
            <div
              key={item.cropKey}
              className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-6 text-center">
                  #{index + 1}
                </Badge>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">{item.cropLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.priceMin.toFixed(0)} → {item.priceMax.toFixed(0)} $ / t
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${item.volatility > 10 ? "text-amber-500" : "text-muted-foreground"}`}>
                  {item.volatility.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
