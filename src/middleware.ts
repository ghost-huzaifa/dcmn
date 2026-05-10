import { type NextRequest, NextResponse } from "next/server";

/**
 * Auth checks run in route layouts via `auth()` (Node) — not here. Edge middleware
 * repeatedly failed to see the session on Vercel while cookies were valid.
 * We only forward the pathname so layouts can build accurate login callback URLs.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/user/:path*", "/admin/:path*", "/plans/:path*", "/plans"],
};
