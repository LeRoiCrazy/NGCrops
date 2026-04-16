"use client";

import { TradeDTO } from "@/types/silo";
import { formatUSD, formatPercent } from "@/lib/portfolio-calculations";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface TradesHistoryProps {
  trades: TradeDTO[];
  isLoading?: boolean;
}

export function TradesHistory({ trades, isLoading = false }: TradesHistoryProps) {
  if (isLoading) {
    return <div className="text-center text-muted-foreground">Chargement...</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">Pas d'historique de trades pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Céréale</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="text-right">Prix d'achat</TableHead>
            <TableHead className="text-right">Prix de vente</TableHead>
            <TableHead className="text-right">Taxe (20%)</TableHead>
            <TableHead className="text-right">Bénéfice net</TableHead>
            <TableHead className="text-right">Date de vente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const montantInvesti = trade.prixAchat * trade.quantité;
            const gainPercent = montantInvesti > 0 
              ? (trade.bénéfice / montantInvesti) * 100
              : 0;

            return (
              <TableRow key={trade._id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium">{trade.cropLabel}</TableCell>
                <TableCell className="text-right">{trade.quantité}</TableCell>
                <TableCell className="text-right">{formatUSD(trade.prixAchat)}</TableCell>
                <TableCell className="text-right">{formatUSD(trade.prixVente)}</TableCell>
                <TableCell className="text-right text-red-400">
                  -{formatUSD(trade.taxeServeur)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="secondary"
                    className={`${
                      trade.bénéfice >= 0
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    } text-white`}
                  >
                    {trade.bénéfice >= 0 ? "+" : ""}
                    {formatUSD(trade.bénéfice)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {format(new Date(trade.dateVente), "dd/MM/yyyy")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
