import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const path = req.nextUrl.pathname;

  const token = secret
    ? await getToken({ req, secret })
    : null;

  const isLoggedIn = !!token;
  const isAdmin = token?.role === "ADMIN";

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
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/plans/:path*", "/plans"],
};
