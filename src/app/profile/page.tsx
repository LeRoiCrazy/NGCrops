import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserById } from "@/infrastructure/users";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { GlobalSignOutButton } from "@/components/auth/global-sign-out-button";
import { getPortfolioStats } from "@/lib/portfolio-stats";

export const metadata = {
  title: "Profil - NGCrops",
  description: "Informations du compte utilisateur",
};

function formatMemberSince(date?: Date | null) {
  if (!date) {
    return "Inconnue";
  }

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatLastLogin(date?: Date | null) {
  if (!date) {
    return "Indisponible";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return "À l'instant";
  } else if (diffMins < 60) {
    return `Il y a ${diffMins} minute${diffMins > 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;
  }

  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.userId || session.user.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  let profile = null;
  try {
    profile = await getUserById(new ObjectId(userId));
  } catch {
    profile = null;
  }

  // Get portfolio stats
  let portfolioStats = { openSilos: 0, closedTrades: 0, netPnL: 0 };
  try {
    portfolioStats = await getPortfolioStats(userId);
  } catch {
    // Stats not available
  }

  const userName = profile?.name || session.user.name || "Compte NGCrops";
  const userEmail = profile?.email || session.user.email || "Email indisponible";
  const userAvatar = profile?.avatar || session.user.image || undefined;
  const discordId = profile?.discordId || session.user.discordId || "Inconnu";
  const memberSince = formatMemberSince(profile?.createdAt ?? null);
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Mon profil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Informations du compte lie a ton authentification Discord.
        </p>
      </section>

      <Card className="bg-card/70">
        <CardHeader>
          <CardTitle>Informations utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{initials || "NG"}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-xl font-semibold text-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
              <Badge variant="outline">Lecture seule</Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Discord ID</p>
              <p className="mt-2 text-sm font-medium text-foreground">{discordId}</p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Membre depuis</p>
              <p className="mt-2 text-sm font-medium text-foreground">{memberSince}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-green-400/30">
        <CardHeader>
          <CardTitle className="text-green-500">Statistiques du portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Silos ouverts</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{portfolioStats.openSilos}</p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Trades fermés</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{portfolioStats.closedTrades}</p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">PnL net</p>
              <p className={`mt-2 text-2xl font-semibold ${portfolioStats.netPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${portfolioStats.netPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/70 border-orange-400/30">
        <CardHeader>
          <CardTitle className="text-orange-500">Sécurité du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fournisseur</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="inline-block size-2 rounded-full bg-blue-500"></span>
                Discord
              </p>
            </div>

            <div className="rounded-lg border border-border bg-background/60 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Dernière connexion</p>
              <p className="mt-2 text-sm font-medium text-foreground">{formatLastLogin(profile?.updatedAt)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <SignOutButton />
            <GlobalSignOutButton />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
