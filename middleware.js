import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import { PUBLIC_ROUTES, ALWAYS_OPEN_ROUTES, LOGIN, ROOT } from "@/lib/routes";

const { auth } = NextAuth(authConfig);

// The middleware runs on the edge and can't query the database, so it asks
// /api/site-status whether the site is closed. The answer is kept in memory
// for a few seconds, and only guests ever trigger the lookup.
const CLOSED_CACHE_MS = 10_000;
let closedCache = { at: 0, value: false };

async function isSiteClosed(origin) {
  const now = Date.now();
  if (now - closedCache.at < CLOSED_CACHE_MS) return closedCache.value;

  try {
    const res = await fetch(new URL("/api/site-status", origin), { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      closedCache = { at: now, value: data?.closed === true };
    }
  } catch {
    // If the lookup fails, keep the last known value instead of locking everyone out.
    closedCache = { ...closedCache, at: now };
  }
  return closedCache.value;
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isAuthenticated = !!req.auth;

  // Closed site: guests may only reach login / register.
  if (!isAuthenticated) {
    const alwaysOpen = ALWAYS_OPEN_ROUTES.some((route) => pathname.startsWith(route));
    if (!alwaysOpen && (await isSiteClosed(nextUrl.origin))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "سایت در حال حاضر فقط برای کاربران واردشده در دسترس است." },
          { status: 503 },
        );
      }
      const loginUrl = new URL(LOGIN, nextUrl);
      loginUrl.searchParams.set("closed", "1");
      return NextResponse.redirect(loginUrl);
    }
  }

  const isPublicRoute =
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === ROOT;

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL(LOGIN, nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next|favicon.ico|.*\\..*).*)", // Exclude Next.js internal routes and API routes
    "/", // Include the root route
  ],
};
