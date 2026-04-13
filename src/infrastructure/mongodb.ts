import { MongoClient, type Collection, type Db, type Document } from "mongodb";

import { getServerEnv } from "@/lib/env";

declare global {
  var __ngcropsMongoClientPromise: Promise<MongoClient> | undefined;
}

async function getMongoClient() {
  const env = getServerEnv();

  if (!globalThis.__ngcropsMongoClientPromise) {
    const client = new MongoClient(env.MONGODB_URI);
    globalThis.__ngcropsMongoClientPromise = client.connect();
  }

  return globalThis.__ngcropsMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const env = getServerEnv();
  const client = await getMongoClient();
  return client.db(env.MONGODB_DB_NAME);
}

export async function getMongoCollection<TSchema extends Document = Document>(
  collectionName: string
): Promise<Collection<TSchema>> {
  const db = await getMongoDb();
  return db.collection<TSchema>(collectionName);
}