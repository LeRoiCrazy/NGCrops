import { Suspense } from "react";

import {
  hasPreviousWeekSnapshot,
  getLatestMarketSnapshot,
  syncLatestMarketSnapshot,
} from "@/application/market-snapshots";
import { MarketTabs } from "@/components/market/market-tabs";
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
      <MarketTabs
        server={result.server}
        snapshotDate={result.snapshotDate}
        source={result.source}
        items={result.items}
      />
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
