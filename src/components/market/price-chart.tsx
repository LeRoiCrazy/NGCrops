"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PricePoint } from "@/types/market";

type PriceChartProps = {
  data: PricePoint[];
  cropLabel: string;
};

export function PriceChart({ data, cropLabel }: PriceChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
        Pas d&apos;historique de prix pour {cropLabel}.
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickFormatter={(value: string) => value.slice(5)}
          />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(value) => {
              const numeric =
                typeof value === "number"
                  ? value
                  : typeof value === "string"
                    ? Number(value)
                    : NaN;

              return [
                Number.isFinite(numeric) ? `${numeric.toFixed(2)}$` : "N/A",
                "Prix",
              ];
            }}
            labelFormatter={(value) => `Date: ${String(value)}`}
            contentStyle={{
              background: "rgb(15 23 42)",
              border: "1px solid rgb(51 65 85)",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}