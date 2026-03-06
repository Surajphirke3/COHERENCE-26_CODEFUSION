// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import UserModel from "@/lib/models/User";

/**
 * NextAuth configuration for Chronos.
 *
 * - CredentialsProvider validates email + password against the User model.
 * - JWT strategy with a 24-hour session lifetime.
 * - Callbacks attach `id` and `role` to the JWT token and session object.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase(),
        }).select("+passwordHash");

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        await UserModel.updateOne(
          { _id: user._id },
          { lastLoginAt: new Date() }
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId.toString(),
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.orgId = (user as unknown as { orgId: string }).orgId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string; role: string; orgId: string }).id =
          token.id as string;
        (session.user as { id: string; role: string; orgId: string }).role =
          token.role as string;
        (session.user as { id: string; role: string; orgId: string }).orgId =
          token.orgId as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
