import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./lib/prisma";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error("User not found:", credentials.email);
            throw new Error("User not found");
          }

          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isMatch) {
            console.error("Password mismatch for:", credentials.email);
            throw new Error("Check your password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.firstName,
          };
        } catch (err) {
          console.error("❌ Authorize error:", err);
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],
});
