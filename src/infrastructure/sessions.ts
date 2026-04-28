import { ObjectId } from "mongodb";
import { getMongoCollection } from "./mongodb";

export interface Session {
  _id?: ObjectId;
  sessionToken: string;
  userId: string | ObjectId;
  expires: Date;
  createdAt?: Date;
}

export async function deleteUserSessions(userId: string | ObjectId): Promise<number> {
  const sessions = await getMongoCollection<Session>("sessions");
  
  const userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
  
  const result = await sessions.deleteMany({
    userId: userObjectId,
  });

  return result.deletedCount || 0;
}

export async function getUserSessions(userId: string | ObjectId): Promise<Session[]> {
  const sessions = await getMongoCollection<Session>("sessions");
  
  const userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
  
  return (await sessions.find({
    userId: userObjectId,
  }).toArray()) as Session[];
}
