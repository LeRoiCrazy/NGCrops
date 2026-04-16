import { ObjectId } from "mongodb";

export type SiloStatus = "OPEN" | "CLOSED";

export interface Silo {
  _id: string; // UUID
  userId: ObjectId;
  cropName: string;
  quantité: number;
  prixAchat: number;
  dateAchat: Date;
  status: SiloStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  _id: string; // UUID
  siloId: string;
  userId: ObjectId;
  cropName: string;
  quantité: number;
  prixAchat: number;
  prixVente: number;
  montantBrut: number; // prixVente * quantité
  taxeServeur: number; // montantBrut * 0.2
  montantNet: number; // montantBrut - taxeServeur
  bénéfice: number; // montantNet - (prixAchat * quantité)
  dateAchat: Date;
  dateVente: Date;
  createdAt: Date;
}

export interface PortfolioItem extends Silo {
  prixActuel: number;
  prixActuelTotal: number;
  montantInvesti: number;
  bénéficePotentiel: number; // montantActuel - montantInvesti (avant taxes)
  bénéficeApresTaxes: number; // (prixActuelTotal * 0.8) - montantInvesti
  pourcentGainPerte: number; // (bénéficeApresTaxes / montantInvesti) * 100
  montantReçuApresTaxes: number; // prixActuelTotal * 0.8
}

// Serializable shapes for passing data from Server Components to Client Components.
export interface PortfolioItemDTO {
  _id: string;
  cropName: string;
  cropLabel: string;
  quantité: number;
  prixAchat: number;
  prixActuel: number;
  prixActuelTotal: number;
  montantInvesti: number;
  bénéficePotentiel: number;
  bénéficeApresTaxes: number;
  pourcentGainPerte: number;
  montantReçuApresTaxes: number;
}

export interface TradeDTO {
  _id: string;
  cropName: string;
  cropLabel: string;
  quantité: number;
  prixAchat: number;
  prixVente: number;
  taxeServeur: number;
  bénéfice: number;
  dateVente: string;
}
