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
            <div className="relative h-11 w-11 overflow-hidden rounded-md border border-border">
              <Image
                src={item.cropImage}
                alt={item.cropLabel}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
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

        <Progress value={item.recommendation.confidence}>
          <ProgressLabel>Confiance</ProgressLabel>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums">
            {item.recommendation.confidence}%
          </span>
        </Progress>

        <p className="text-sm text-muted-foreground">{item.recommendation.reason}</p>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Evolution des prix
          </p>
          <PriceChart data={item.priceHistory} cropLabel={item.cropLabel} />
        </div>
      </CardContent>
    </Card>
  );
}