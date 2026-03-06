// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth.js route handler.
 * Exports GET and POST handlers for all /api/auth/* routes.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
