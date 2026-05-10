import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

/**
 * Middleware uses the same JWT/session callbacks as the app but a stub Credentials provider
 * (no Prisma). Session is resolved via Auth.js internals — same path as `/api/auth/session`,
 * so cookie names, secrets, and decoding stay in sync with production proxies.
 */
export default NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
}).auth((req) => {
  const path = req.nextUrl.pathname;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.nextUrl.origin);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/user/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  const protectedPrefixes = ["/user", "/plans"];
  const needsAuth = protectedPrefixes.some((p) => path.startsWith(p));
  if (needsAuth && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/plans/:path*", "/plans"],
};
