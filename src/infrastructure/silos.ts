import { ObjectId } from "mongodb";
import { getMongoCollection } from "./mongodb";
import { Silo, Trade, SiloStatus } from "@/types/silo";
import { v4 as uuidv4 } from "uuid";

export async function createSilo(
  userId: ObjectId,
  cropName: string,
  quantité: number,
  prixAchat: number,
  dateAchat: Date = new Date()
): Promise<Silo> {
  const silos = await getMongoCollection<Silo>("silos");
  const now = new Date();
  const silo: Silo = {
    _id: uuidv4(),
    userId,
    cropName,
    quantité,
    prixAchat,
    dateAchat,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };

  await silos.insertOne(silo as any);
  return silo;
}

export async function getSilosForUser(userId: ObjectId): Promise<Silo[]> {
  const silos = await getMongoCollection<Silo>("silos");
  return (await silos
    .find({ userId, status: "OPEN" })
    .sort({ createdAt: -1 })
    .toArray()) as Silo[];
}

export async function getSiloById(siloId: string): Promise<Silo | null> {
  const silos = await getMongoCollection<Silo>("silos");
  return (await silos.findOne({ _id: siloId })) as Silo | null;
}

export async function closeSilo(
  siloId: string,
  prixVente: number
): Promise<Trade> {
  const silos = await getMongoCollection<Silo>("silos");
  const trades = await getMongoCollection<Trade>("trades");

  const silo = await silos.findOne({ _id: siloId });
  if (!silo) throw new Error("Silo not found");
  if (silo.status !== "OPEN") throw new Error("Silo is not open");

  const montantBrut = prixVente * silo.quantité;
  const taxeServeur = montantBrut * 0.2;
  const montantNet = montantBrut - taxeServeur;
  const montantInvesti = silo.prixAchat * silo.quantité;
  const bénéfice = montantNet - montantInvesti;

  const now = new Date();
  const trade: Trade = {
    _id: uuidv4(),
    siloId,
    userId: silo.userId,
    cropName: silo.cropName,
    quantité: silo.quantité,
    prixAchat: silo.prixAchat,
    prixVente,
    montantBrut,
    taxeServeur,
    montantNet,
    bénéfice,
    dateAchat: silo.dateAchat,
    dateVente: now,
    createdAt: now,
  };

  // Update silo status to CLOSED
  await silos.updateOne({ _id: siloId }, { $set: { status: "CLOSED", updatedAt: now } });

  // Insert trade record
  await trades.insertOne(trade as any);

  return trade;
}

export async function getTradesForUser(userId: ObjectId): Promise<Trade[]> {
  const trades = await getMongoCollection<Trade>("trades");
  return (await trades
    .find({ userId })
    .sort({ dateVente: -1 })
    .toArray()) as Trade[];
}

export async function ensureSilosIndexes() {
  const silos = await getMongoCollection<Silo>("silos");
  const trades = await getMongoCollection<Trade>("trades");

  await silos.createIndex({ userId: 1, status: 1 });
  await silos.createIndex({ createdAt: -1 });

  await trades.createIndex({ userId: 1, dateVente: -1 });
  await trades.createIndex({ siloId: 1 });
}
