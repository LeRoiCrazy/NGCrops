import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSilosForUser, getTradesForUser } from "@/infrastructure/silos";
import { getLatestMarketSnapshot } from "@/application/market-snapshots";
import { calculatePortfolioItem } from "@/lib/portfolio-calculations";
import { SilosTable } from "@/components/portfolio/silos-table";
import { TradesHistory } from "@/components/portfolio/trades-history";
import { SiloForm } from "@/components/portfolio/silo-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Portfolio - NGCrops",
  description: "Gère tes silos et historique de trades",
};

async function loadPortfolioData(userId: string) {
  try {
    const objectId = new ObjectId(userId);

    // Load silos and trades in parallel
    const [silos, trades] = await Promise.all([
      getSilosForUser(objectId),
      getTradesForUser(objectId),
    ]);

    // Load market snapshot to get current prices
    const snapshot = await getLatestMarketSnapshot("mocha");

    // Calculate portfolio items with current prices
    const portfolioItems = silos.map((silo) => {
      const prixActuel = snapshot?.payload.data.cerealsPrice[silo.cropName] || silo.prixAchat;
      return calculatePortfolioItem(silo, prixActuel);
    });

    return {
      portfolioItems,
      trades,
      error: null,
    };
  } catch (error) {
    console.error("Failed to load portfolio:", error);
    return {
      portfolioItems: [],
      trades: [],
      error: "Erreur lors du chargement du portfolio",
    };
  }
}

export default async function PortfolioPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.userId || session.user.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  const { portfolioItems, trades, error } = await loadPortfolioData(userId);

  const handleAddSilo = async (data: {
    cropName: string;
    quantité: number;
    prixAchat: number;
    dateAchat: Date;
  }) => {
    "use server";

    // This will be called from the client component
    // We'll implement this in a server action
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mon Portfolio</h1>
          <p className="text-muted-foreground">
            Gère tes silos et suis tes investissements
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="silos" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="silos">
                Mes silos ({portfolioItems.length})
              </TabsTrigger>
              <TabsTrigger value="historique">
                Historique ({trades.length})
              </TabsTrigger>
            </TabsList>
            <SiloForm onSubmit={handleAddSilo} />
          </div>

          {/* Silos Tab */}
          <TabsContent value="silos" className="space-y-4">
            {portfolioItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Total portfolio value */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Valeur totale
                  </div>
                  <div className="text-2xl font-bold">
                    ${portfolioItems
                      .reduce((sum, item) => sum + item.prixActuelTotal, 0)
                      .toFixed(2)}
                  </div>
                </div>

                {/* Total invested */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Investi
                  </div>
                  <div className="text-2xl font-bold">
                    ${portfolioItems
                      .reduce((sum, item) => sum + item.montantInvesti, 0)
                      .toFixed(2)}
                  </div>
                </div>

                {/* Total profit after taxes */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">
                    Bénéfice potentiel (après taxes)
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      portfolioItems.reduce((sum, item) => sum + item.bénéficeApresTaxes, 0) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {portfolioItems.reduce((sum, item) => sum + item.bénéficeApresTaxes, 0) >= 0
                      ? "+"
                      : ""}
                    ${portfolioItems
                      .reduce((sum, item) => sum + item.bénéficeApresTaxes, 0)
                      .toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <SilosTable items={portfolioItems} onRefresh={async () => {}} />
          </TabsContent>

          {/* Historique Tab */}
          <TabsContent value="historique" className="space-y-4">
            <TradesHistory trades={trades} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
