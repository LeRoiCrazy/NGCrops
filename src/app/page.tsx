import { Suspense } from "react";

import {
  hasPreviousWeekSnapshot,
  getLatestMarketSnapshot,
  syncLatestMarketSnapshot,
} from "@/application/market-snapshots";
import { CropCard } from "@/components/market/crop-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildCropMarketItems } from "@/lib/market";

type MarketLoadResult =
  | {
      ok: true;
      server: string;
      snapshotDate: string;
      source: "mongodb" | "yoxo";
      items: ReturnType<typeof buildCropMarketItems>;
    }
  | {
      ok: false;
      message: string;
    };

async function loadMarketData(): Promise<MarketLoadResult> {
  const defaultServer = process.env.NEXT_PUBLIC_DEFAULT_SERVER?.trim() || "mocha";

  try {
    const snapshot = await getLatestMarketSnapshot(defaultServer);

    if (snapshot) {
      const includePreviousWeekSignals = await hasPreviousWeekSnapshot(
        snapshot.server,
        snapshot.snapshotDate
      );

      return {
        ok: true,
        server: snapshot.server,
        snapshotDate: snapshot.snapshotDate,
        source: "mongodb",
        items: buildCropMarketItems(snapshot.payload, {
          includePreviousWeekSignals,
        }),
      };
    }

    const { snapshot: freshSnapshot } = await syncLatestMarketSnapshot(defaultServer);
    const includePreviousWeekSignals = await hasPreviousWeekSnapshot(
      freshSnapshot.metadata.server,
      freshSnapshot.metadata.date
    );

    return {
      ok: true,
      server: freshSnapshot.metadata.server,
      snapshotDate: freshSnapshot.metadata.date,
      source: "yoxo",
      items: buildCropMarketItems(freshSnapshot, {
        includePreviousWeekSignals,
      }),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Impossible de recuperer les donnees Yoxo.",
    };
  }
}

async function MarketContent() {
  const result = await loadMarketData();

  if (!result.ok) {
    return (
      <Card className="bg-card/80">
        <CardContent className="space-y-2 py-8 text-center">
          <p className="text-base font-medium text-foreground">Erreur de chargement</p>
          <p className="text-sm text-muted-foreground">{result.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (result.items.length === 0) {
    return (
      <Card className="bg-card/80">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Aucune donnee de marche n&apos;a ete retournee pour cette date.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-card/80 p-5 backdrop-blur">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>NGCrops</Badge>
          <Badge variant="outline">Serveur: {result.server}</Badge>
          <Badge variant="secondary">Snapshot: {result.snapshotDate}</Badge>
          <Badge variant="outline">
            Source: {result.source === "mongodb" ? "MongoDB" : "Yoxo live"}
          </Badge>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Marche global des cereals
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recommandations simples basees uniquement sur la position du prix dans sa plage recente.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.items.map((item) => (
          <CropCard key={item.cropKey} item={item} />
        ))}
      </section>
    </>
  );
}

function LoadingState() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="bg-card/80 p-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </Card>
      ))}
    </section>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
      <Suspense fallback={<LoadingState />}>
        <MarketContent />
      </Suspense>
    </main>
  );
}
