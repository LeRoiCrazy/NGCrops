"use client";

import Link from "next/link";
import { auth } from "@/auth";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Session } from "next-auth";

export function NavBar() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { auth: getAuth } = await import("@/auth");
      const sess = await getAuth();
      setSession(sess);
    };
    getSession();
  }, []);

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold text-foreground">
          NGCrops
        </Link>

        <div className="flex gap-3 items-center">
          {session?.user ? (
            <>
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">
                  Mon portfolio
                </Button>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Se déconnecter
                </Button>
              </form>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm">Se connecter</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
