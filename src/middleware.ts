// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/api/auth");
  const isWebhookRoute = pathname.startsWith("/api/webhooks");
  const isProtectedAppRoute =
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/workflows") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/safety") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/dashboard");
  const isProtectedApiRoute = pathname.startsWith("/api/");

  if (isAuthRoute || isWebhookRoute || (!isProtectedAppRoute && !isProtectedApiRoute)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    if (isProtectedAppRoute) {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", token.id as string);
  requestHeaders.set("x-user-role", (token.role as string) || "member");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/:path*", "/api/:path*"],
};
