import { NextRequest, NextResponse } from "next/server";

const SENSITIVE_PATHS = [
  "/api/admin/login", "/api/admin/login-sub", "/api/admin/register",
  "/api/1.0/login", "/api/1.0/register", "/api/1.0/init",
];

const rateMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, maxRequests = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // === SECURITY HEADERS ===
  const headers = new Headers();
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-XSS-Protection", "1; mode=block");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // === RATE LIMITING ===
  if (SENSITIVE_PATHS.some((p) => pathname.startsWith(p))) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "0.0.0.0";
    const key = `${ip}:${pathname}`;
    if (!rateLimit(key, 5, 60_000)) {
      return new NextResponse(JSON.stringify({ success: false, message: "Too many requests. Try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" },
      });
    }
  }

  // === APP COOKIE ===
  let appId: string | null = null;
  const appDetailMatch = pathname.match(/^\/dashboard\/apps\/([^\/]+)$/);
  if (appDetailMatch && appDetailMatch[1] !== "new") appId = appDetailMatch[1];
  if (!appId) {
    const q = searchParams.get("app");
    if (q && ["/dashboard/licenses", "/dashboard/users", "/dashboard/logs"].includes(pathname)) appId = q;
  }
  if (appId) {
    const res = NextResponse.next();
    res.cookies.set("ka_current_app", appId, { httpOnly: false, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    Object.entries(headers.toJSON ? headers.toJSON() : {}).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  const res = NextResponse.next();
  Object.entries(headers.toJSON ? headers.toJSON() : {}).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = {
  matcher: ["/dashboard/apps/:id", "/dashboard/licenses", "/dashboard/users", "/dashboard/logs", "/api/:path*"],
};
