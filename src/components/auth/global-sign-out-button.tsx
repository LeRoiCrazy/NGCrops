"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { globalSignOut } from "@/app/profile/actions";

export function GlobalSignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGlobalSignOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await globalSignOut();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={handleGlobalSignOut}
        disabled={isLoading}
        className="opacity-80 hover:opacity-100"
      >
        {isLoading ? "Déconnexion en cours..." : "Déconnexion globale"}
      </Button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </>
  );
}
