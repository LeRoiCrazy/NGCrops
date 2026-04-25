import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserById } from "@/infrastructure/users";

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
    </main>
  );
}
