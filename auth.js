import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { User } from "./model/user-model";
import { dbConnect } from "./service/mongo";

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
        console.log("1️⃣ Authorize started");

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          // ✅ مهم: اول اتصال به دیتابیس
          console.log("2️⃣ Connecting to database...");
          await dbConnect();
          console.log("3️⃣ Connected to database");

          // جستجوی کاربر
          console.log("4️⃣ Finding user:", credentials.email);
          const user = await User.findOne({ email: credentials.email });
          console.log("5️⃣ User found:", user ? "Yes" : "No");

          if (!user) {
            console.error("User not found:", credentials.email);
            throw new Error("User not found");
          }

          // بررسی رمز عبور
          console.log("6️⃣ Checking password");
          const isMatch = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isMatch) {
            console.error("Password mismatch for:", credentials.email);
            throw new Error("Check your password");
          }

          console.log("7️⃣ Authentication successful");
          // برگرداندن user object (بدون password)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (err) {
          console.error("❌ Authorize error:", err);
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],
});
