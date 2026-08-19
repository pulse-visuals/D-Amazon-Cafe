import { NextResponse } from "next/server";

/**
 * Minimal in-memory rate limiter. Good enough for a single-instance deployment
 * (this app's local SQLite database already assumes that topology). For a
 * multi-instance production deployment, swap this for a shared store such as
 * Upstash Redis or a database-backed counter.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || "unknown";
}

/** Returns a 429 NextResponse if the caller is over the limit, otherwise null. */
export function rateLimit(req: Request, bucket: string, limit: number, windowMs: number): NextResponse | null {
  const key = `${bucket}:${clientKey(req)}`;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;
  if (entry.count > limit) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }
  return null;
}
