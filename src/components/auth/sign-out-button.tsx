"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      className="border-orange-400/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-600"
      onClick={() => {
        void signOut({ callbackUrl: "/auth/signin" });
      }}
    >
      Se déconnecter
    </Button>
  );
}
