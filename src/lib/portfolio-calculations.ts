import { Silo, PortfolioItem } from "@/types/silo";

/**
 * Calcule les valeurs du portfolio d'un silo
 * En tenant compte du prix actuel du marché et de la taxe serveur (20%)
 */
export function calculatePortfolioItem(
  silo: Silo,
  prixActuel: number
): PortfolioItem {
  const montantInvesti = silo.prixAchat * silo.quantité;
  const prixActuelTotal = prixActuel * silo.quantité;
  const bénéficePotentiel = prixActuelTotal - montantInvesti;
  
  // Après taxes 20%
  const montantReçuApresTaxes = prixActuelTotal * 0.8;
  const bénéficeApresTaxes = montantReçuApresTaxes - montantInvesti;
  
  const pourcentGainPerte =
    montantInvesti > 0 ? (bénéficeApresTaxes / montantInvesti) * 100 : 0;

  return {
    ...silo,
    prixActuel,
    prixActuelTotal,
    montantInvesti,
    bénéficePotentiel,
    bénéficeApresTaxes,
    pourcentGainPerte,
    montantReçuApresTaxes,
  };
}

/**
 * Format un nombre en USD avec 2 décimales
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format un pourcentage avec 2 décimales et signe
 */
export function formatPercent(percent: number): string {
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * Détermine la couleur du badge basée sur le gain/perte
 */
export function getPortfolioBadgeColor(percent: number): string {
  if (percent >= 0) return "bg-emerald-500"; // Gain
  return "bg-red-500"; // Perte
}

/**
 * Détermine la couleur du badge après taxes
 */
export function getPortfolioBadgeColorAfterTax(bénéficeApresTaxes: number): string {
  if (bénéficeApresTaxes >= 0) return "bg-emerald-500"; // Profit
  return "bg-red-500"; // Loss
}
