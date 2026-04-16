"use client";

import { useState } from "react";
import { PortfolioItem } from "@/types/silo";
import { formatUSD, formatPercent } from "@/lib/portfolio-calculations";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertTriangle, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons";



interface SellModalProps {
  siloId: string;
  item: PortfolioItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SellModal({
  siloId,
  item,
  isOpen,
  onClose,
  onSuccess,
}: SellModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSell = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/portfolio/silos/${siloId}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prixVente: item.prixActuel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors de la vente");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const taxeAmount = item.prixActuelTotal * 0.2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Confirmer la vente</DialogTitle>
        </DialogHeader>
        <Separator className="my-4" />

        <div className="space-y-4">
          {/* Silo Details */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Céréale</div>
            <div className="text-lg font-semibold">{item.cropName}</div>
          </div>

          <Separator />

          {/* Economics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground uppercase">Quantité</div>
              <div className="text-lg font-mono">{item.quantité}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase">Prix actuel</div>
              <div className="text-lg font-mono">{formatUSD(item.prixActuel)}</div>
            </div>
          </div>

          <div className="bg-muted/50 rounded p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Montant brut (quantité × prix):</span>
              <span className="font-mono">{formatUSD(item.prixActuelTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Taxe serveur (20%):</span>
              <span className="font-mono text-red-400">-{formatUSD(taxeAmount)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Tu vas recevoir:</span>
              <span className="text-emerald-400 font-mono">
                {formatUSD(item.montantReçuApresTaxes)}
              </span>
            </div>
          </div>

          {/* Profit/Loss */}
          <div className="bg-muted/50 rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Bénéfice net:</span>
              <span
                className={`font-semibold font-mono ${
                  item.bénéficeApresTaxes >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {item.bénéficeApresTaxes >= 0 ? "+" : ""}
                {formatUSD(item.bénéficeApresTaxes)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm">Gain/Perte:</span>
              <Badge
                variant="secondary"
                className={`${
                  item.bénéficeApresTaxes >= 0
                    ? "bg-emerald-500"
                    : "bg-red-500"
                } text-white`}
              >
                {formatPercent(item.pourcentGainPerte)}
              </Badge>
            </div>
          </div>

          {/* Warning if negative */}
          {item.bénéficeApresTaxes < 0 && (
            <div className="flex gap-2 items-start bg-red-500/10 border border-red-500/20 rounded p-3">
              <HugeiconsIcon 
                icon={AlertTriangle} 
                className="h-5 w-5 shrink-0 mt-0.5 text-red-500" 
              />
              <p className="text-sm text-red-400">
                Attention: Tu vas perdre de l'argent en vendant maintenant. Les taxes
                aggraveront la perte.
              </p>
            </div>
          )}

          {/* Success if positive */}
          {item.bénéficeApresTaxes > 0 && (
            <div className="flex gap-2 items-start bg-emerald-500/10 border border-emerald-500/20 rounded p-3">
              <HugeiconsIcon 
                icon={CheckmarkBadge01Icon} 
                className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" 
              />
              <p className="text-sm text-emerald-400">
                Bon investissement! Tu vas réaliser un profit de{" "}
                <span className="font-semibold">{formatUSD(item.bénéficeApresTaxes)}</span>.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Button
            onClick={handleSell}
            disabled={isLoading}
            className="flex-1"
            variant="default"
          >
            {isLoading ? "Vente en cours..." : "Confirmer la vente"}
          </Button>
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
