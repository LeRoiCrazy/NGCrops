import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";


export const metadata = {
  title: "Se connecter - NGCrops",
  description: "Se connecter avec Discord",
};

export default async function SignInPage() {
  const session = await auth();

  // Already signed in
  if (session) {
    redirect("/portfolio");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Se connecter</h1>
            <p className="text-muted-foreground text-sm">
              Connecte-toi avec ton compte Discord pour accéder à NGCrops.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("discord", { redirectTo: "/portfolio" });
            }}
          >
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              Continuer avec Discord
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            En cliquant sur continuer, tu acceptes nos conditions d'utilisation.
          </p>
        </div>
      </div>
    </div>
  );
}
