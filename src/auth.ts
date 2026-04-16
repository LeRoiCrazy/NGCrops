import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "@/infrastructure/mongodb";
import { getOrCreateUser, ensureUsersIndexes } from "@/infrastructure/users";
import { ensureSilosIndexes } from "@/infrastructure/silos";
import type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      email?: string;
      image?: string;
      name?: string;
      discordId?: string;
      userId?: string; // MongoDB ObjectId
    };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],

  adapter: MongoDBAdapter(getMongoClient() as any),

  callbacks: {
    async signIn({ profile }) {
      // Ensure indexes on app startup
      try {
        await ensureUsersIndexes();
        await ensureSilosIndexes();
      } catch (e) {
        console.error("Index creation failed:", e);
      }

      return true;
    },

    async session({ session }) {
      if (session.user && session.user.email) {
        // Load user profile to get MongoDB ID
        const userProfile = await getOrCreateUser(
          session.user.email,
          session.user.email,
          session.user.name || "Unknown",
          session.user.image
        );
        
        // Add MongoDB userId to session
        (session.user as any).userId = userProfile._id?.toString();
        (session.user as any).discordId = userProfile.discordId;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
