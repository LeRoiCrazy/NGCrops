"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { CropMarketItem } from "@/types/market";
import { buildMultiCropPriceChartData, type MarketChartRange } from "@/lib/market";

type MultiCropPriceChartProps = {
  items: CropMarketItem[];
  range: MarketChartRange;
};

export function MultiCropPriceChart({ items, range }: MultiCropPriceChartProps) {
  const { points, series } = useMemo(
    () => buildMultiCropPriceChartData(items, range),
    [items, range]
  );

  const chartConfig = useMemo(
    () =>
      series.reduce<Record<string, { label: string; color: string }>>((acc, item) => {
        acc[item.cropKey] = {
          label: item.cropLabel,
          color: item.color,
        };
        return acc;
      }, {}),
    [series]
  );

  if (series.length === 0 || points.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-card/50 text-sm text-muted-foreground">
        Pas assez de donnees historiques pour afficher le graphique.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-96 w-full rounded-xl border border-border bg-card/70 p-4">
      <LineChart data={points} margin={{ top: 16, right: 14, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value: string) => value.slice(5)}
          minTickGap={18}
        />
        <YAxis
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          width={48}
          domain={[0, 2250]}
          allowDataOverflow
        />
        <ChartTooltip
          cursor={{ stroke: "rgba(148, 163, 184, 0.35)", strokeWidth: 1 }}
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                const numeric =
                  typeof value === "number"
                    ? value
                    : typeof value === "string"
                      ? Number(value)
                      : NaN;

                return [
                  Number.isFinite(numeric) ? `${numeric.toFixed(2)}$ / t` : "N/A",
                  String(name),
                ];
              }}
              labelFormatter={(value) => `Date: ${String(value)}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />

        {series.map((item) => (
          <Line
            key={item.cropKey}
            type="monotone"
            dataKey={item.cropKey}
            name={item.cropLabel}
            stroke={item.color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
