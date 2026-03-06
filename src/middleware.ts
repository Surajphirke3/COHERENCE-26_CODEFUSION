// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js Edge Middleware
 *
 * Protects all routes under /dashboard/* and /api/* (except auth & webhook routes).
 * Unauthenticated users are redirected to /login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public API routes that don't require authentication
  const isAuthRoute = pathname.startsWith("/api/auth");
  const isWebhookRoute = pathname.startsWith("/api/webhooks");

  if (isAuthRoute || isWebhookRoute) {
    return NextResponse.next();
  }

  // Check for session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect unauthenticated users trying to access protected routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Attach user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", token.id as string);
  requestHeaders.set("x-user-role", (token.role as string) || "member");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/((?!auth|webhooks).*)"],
};
