const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  opts: { maxRequests?: number; windowMs?: number } = {}
): { allowed: boolean; retryAfter: number } {
  const maxRequests = opts.maxRequests ?? 10;
  const windowMs = opts.windowMs ?? 60_000;
  const now = Date.now();
  const entry = rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  entry.count++;
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true, retryAfter: 0 };
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}
