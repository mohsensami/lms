import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
            throw new Error("کاربری با این ایمیل پیدا نشد.");
          }

          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isMatch) {
            console.error("Password mismatch for:", credentials.email);
            throw new Error("رمز عبور اشتباه است.");
          }

          if (user.isActive === false) {
            console.error("Deactivated account tried to log in:", credentials.email);
            throw new Error("این حساب کاربری غیرفعال شده است.");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.firstName,
          };
        } catch (err) {
          console.error("❌ Authorize error:", err);
          throw new Error(err.message || "ورود ناموفق بود. دوباره تلاش کنید.");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // This app has no NextAuth database adapter (it manages its own `User`
    // table directly via Prisma), so Google sign-ins are provisioned here by
    // hand: the first time someone signs in with Google, create a matching
    // User row if one doesn't already exist (matched by email). Every other
    // part of the app looks the user up by `session.user.email`, so nothing
    // else needs to change for Google-authenticated users to work.
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user?.email) {
        return false;
      }

      // Only trust e-mail addresses that Google itself has verified.
      if (profile?.email_verified === false) {
        console.error("Google account with unverified e-mail rejected:", user.email);
        return false;
      }

      // Google serves the avatar as a small 96px image by default; ask for a
      // sharper one (the URL suffix "=s96-c" means "96px, cropped square").
      const googlePicture = (profile?.picture || user.image || "").replace(/=s\d+-c$/, "=s256-c") || null;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const [fallbackFirst, ...rest] = (user.name || "کاربر گوگل").split(" ");
          const firstName = profile?.given_name || fallbackFirst;
          const lastName = profile?.family_name || rest.join(" ");
          // Google accounts don't have a password in our system; store a
          // random, never-used hash just to satisfy the required column.
          const randomPassword = await bcrypt.hash(crypto.randomUUID(), 5);

          await prisma.user.create({
            data: {
              firstName: firstName || "کاربر",
              lastName: lastName || "گوگل",
              email: user.email,
              password: randomPassword,
              role: "student",
              profilePicture: googlePicture,
            },
          });

          // Welcome e-mail for brand-new Google accounts. Loaded lazily and
          // never allowed to break the sign-in.
          try {
            const { sendWelcomeEmail } = await import("@/lib/email/notify");
            await sendWelcomeEmail({
              firstName: firstName || "کاربر",
              lastName: lastName || "",
              email: user.email,
            });
          } catch (error) {
            console.error("Welcome e-mail failed:", error?.message);
          }
        } else if (existingUser.isActive === false) {
          console.error("Deactivated account tried to log in via Google:", user.email);
          return false;
        } else if (!existingUser.profilePicture && googlePicture) {
          // Existing account (e.g. registered with e-mail first) that has no
          // picture yet: use the Google one. A picture the user uploaded
          // themselves is never overwritten.
          await prisma.user.update({
            where: { email: user.email },
            data: { profilePicture: googlePicture },
          });
        }

        return true;
      } catch (err) {
        console.error("❌ Google sign-in provisioning error:", err);
        return false;
      }
    },
  },
});
