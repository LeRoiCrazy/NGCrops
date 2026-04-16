import { ObjectId } from "mongodb";
import { getMongoCollection } from "./mongodb";

export interface UserProfile {
  _id?: ObjectId;
  discordId: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getOrCreateUser(
  discordId: string,
  email: string,
  name: string,
  avatar?: string
): Promise<UserProfile> {
  const users = await getMongoCollection<UserProfile>("users");
  const now = new Date();

  const result = await users.findOneAndUpdate(
    { discordId },
    {
      $set: {
        email,
        name,
        avatar,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return (result || { discordId, email, name, avatar, createdAt: now, updatedAt: now }) as UserProfile;
}

export async function getUserByDiscordId(discordId: string): Promise<UserProfile | null> {
  const users = await getMongoCollection<UserProfile>("users");
  return (await users.findOne({ discordId })) as UserProfile | null;
}

export async function getUserById(userId: ObjectId): Promise<UserProfile | null> {
  const users = await getMongoCollection<UserProfile>("users");
  return (await users.findOne({ _id: userId })) as UserProfile | null;
}

export async function ensureUsersIndexes() {
  const users = await getMongoCollection<UserProfile>("users");
  await users.createIndex({ discordId: 1 }, { unique: true });
}
