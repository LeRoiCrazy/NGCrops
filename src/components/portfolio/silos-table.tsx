"use client";

import { useState } from "react";
import { PortfolioItem } from "@/types/silo";
import { formatUSD, formatPercent, getPortfolioBadgeColorAfterTax } from "@/lib/portfolio-calculations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SellModal } from "./sell-modal";


interface SilosTableProps {
  items: PortfolioItem[];
  isLoading?: boolean;
  onRefresh: () => Promise<void>;
}

export function SilosTable({ items, isLoading = false, onRefresh }: SilosTableProps) {
  const [sellingSiloId, setSellingSiloId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Chargement...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Pas de silos pour le moment.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Ajoute un silo pour commencer à suivre tes investissements.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Céréale</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
              <TableHead className="text-right">Prix d'achat</TableHead>
              <TableHead className="text-right">Prix actuel</TableHead>
              <TableHead className="text-right">Gain/Perte (%)</TableHead>
              <TableHead className="text-right">Après taxes ($)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium">{item.cropName}</TableCell>
                <TableCell className="text-right">{item.quantité}</TableCell>
                <TableCell className="text-right">{formatUSD(item.prixAchat)}</TableCell>
                <TableCell className="text-right">{formatUSD(item.prixActuel)}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={`${getPortfolioBadgeColorAfterTax(
                      item.bénéficeApresTaxes
                    )} text-white`}
                  >
                    {formatPercent(item.pourcentGainPerte)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {item.bénéficeApresTaxes >= 0 ? "+" : ""}
                  {formatUSD(item.bénéficeApresTaxes)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setSellingSiloId(item._id)}
                  >
                    Vendre
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sellingSiloId && (
        <SellModal
          siloId={sellingSiloId}
          item={items.find((i) => i._id === sellingSiloId)!}
          isOpen={!!sellingSiloId}
          onClose={() => setSellingSiloId(null)}
          onSuccess={() => {
            setSellingSiloId(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
