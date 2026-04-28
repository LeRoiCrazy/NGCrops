import { ObjectId } from "mongodb";
import { getMongoCollection } from "@/infrastructure/mongodb";
import type { Silo, Trade } from "@/types/silo";

export interface PortfolioStats {
  openSilos: number;
  closedTrades: number;
  netPnL: number;
}

export async function getPortfolioStats(userId: string | ObjectId): Promise<PortfolioStats> {
  const userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;

  // Get silos collection
  const silos = await getMongoCollection<Silo>("silos");
  const trades = await getMongoCollection<Trade>("trades");

  try {
    // Count open silos
    const openSilos = await silos.countDocuments({
      userId: userObjectId,
      status: "OPEN",
    });

    // Get closed trades (trades for this user)
    const closedTradesList = await trades
      .find({
        userId: userObjectId,
      })
      .toArray();

    const closedTrades = closedTradesList.length;

    // Calculate net PnL (sum of bénéfice from all trades)
    const netPnL = closedTradesList.reduce((sum, trade) => sum + (trade.bénéfice || 0), 0);

    return {
      openSilos,
      closedTrades,
      netPnL,
    };
  } catch (error) {
    console.error("Error calculating portfolio stats:", error);
    return {
      openSilos: 0,
      closedTrades: 0,
      netPnL: 0,
    };
  }
}
