import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/** Must match Auth.js `defaultCookies(useSecureCookies)` — on HTTPS the session cookie is `__Secure-authjs.session-token`. */
function isHttps(req: NextRequest): boolean {
  const forwarded = req.headers.get("x-forwarded-proto");
  if (forwarded === "https") return true;
  if (forwarded === "http") return false;
  return req.nextUrl.protocol === "https:";
}

export async function middleware(req: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const path = req.nextUrl.pathname;
  const secureCookie = isHttps(req);

  const token = secret
    ? await getToken({ req, secret, secureCookie })
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
