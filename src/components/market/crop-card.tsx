import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PriceChart } from "@/components/market/price-chart";
import type { CropMarketItem } from "@/types/market";

type CropCardProps = {
  item: CropMarketItem;
};

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "N/A";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function trendLabel(value: "up" | "down" | "flat") {
  if (value === "up") return "Hausse";
  if (value === "down") return "Baisse";
  return "Stable";
}

function confidenceColorClass(confidence: number) {
  if (confidence >= 75) {
    return "bg-emerald-500";
  }

  if (confidence >= 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

function recommendationBadgeVariant(signal: CropMarketItem["recommendation"]["signal"]) {
  if (signal === "BUY") {
    return "default";
  }

  if (signal === "SELL") {
    return "destructive";
  }

  return "outline";
}

export function CropCard({ item }: CropCardProps) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardDescription>Crop</CardDescription>
            <CardTitle className="text-base sm:text-lg">{item.cropLabel}</CardTitle>
          </div>
          {item.cropImage ? (
            <div className="relative h-[31px] w-[68px] overflow-hidden rounded-md border border-border bg-black/20">
              <Image
                src={item.cropImage}
                alt={item.cropLabel}
                fill
                sizes="68px"
                className="object-contain"
              />
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Prix actuel</p>
          <p className="text-lg font-semibold text-foreground">
            {item.currentPrice !== null ? `${item.currentPrice.toFixed(2)}$` : "N/A"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant={recommendationBadgeVariant(item.recommendation.signal)}>
            {item.recommendation.signal}
          </Badge>
          <span className="text-xs text-muted-foreground">Serveur: mocha</span>
        </div>

        <Progress
          value={item.recommendation.confidence}
          indicatorClassName={confidenceColorClass(item.recommendation.confidence)}
        >
          <ProgressLabel>Confiance</ProgressLabel>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {item.recommendation.confidence}%
          </span>
        </Progress>

        <p className="text-sm text-muted-foreground">{item.recommendation.reason}</p>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <p>
            Position 14j: {item.recommendation.details.pricePosition14d !== null
              ? `${(item.recommendation.details.pricePosition14d * 100).toFixed(0)}%`
              : "N/A"}
          </p>
          <p>Stocks: {trendLabel(item.recommendation.details.stockTrend)}</p>
          <p>Ventes: {trendLabel(item.recommendation.details.salesTrend)}</p>
          <p>Delta prix: {formatPercent(item.recommendation.details.deltas.price.percent)}</p>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Semaine precedente: {item.recommendation.details.weekOverWeekUsed ? "prise en compte" : "ignoree (pas en BDD)"}
        </p>

        <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
          {item.recommendation.reasons.slice(0, 3).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-2 min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Evolution des prix
          </p>
          <PriceChart data={item.priceHistory} cropLabel={item.cropLabel} />
        </div>
      </CardContent>
    </Card>
  );
}