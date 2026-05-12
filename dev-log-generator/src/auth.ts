// Central Auth Config File
//src/app/api/auth/[...nextauth]/route.ts is just the thin route file that exposes the generated GET and POST handlers from auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./database/drizzle";
import { accounts, sessions, users, verificationTokens } from "./database/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers:[
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // CRITICAL: This asks the user for permission to read their repositories
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
});