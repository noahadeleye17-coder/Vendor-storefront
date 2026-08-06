// Simple in-memory fixed-window rate limiter.
//
// This is deliberately not backed by Redis/Upstash — the goal is to stop
// accidental hammering (a buggy client retry loop, someone refreshing fast)
// and cap worst-case Groq spend, not to survive a coordinated attack. Good
// enough for a low-traffic project with $0 infra budget.
//
// Known limitation: state lives in the function instance's memory, so on
// Vercel it resets on cold start and isn't shared across concurrent
// instances under real scale-out. If this project outgrows that, swap this
// for Upstash Redis (`@upstash/ratelimit`) — same call signature, durable
// counts. Fine as-is for the traffic this app sees today.
const buckets = new Map();

// Prevents unbounded memory growth from one-off IPs that never come back —
// runs occasionally rather than on every call.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * @param {string} key - identifies the caller (e.g. `ip:1.2.3.4`)
 * @param {number} limit - max requests allowed per window
 * @param {number} windowMs - window length in milliseconds
 * @returns {{ allowed: boolean, remaining: number, retryAfterSeconds: number }}
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  cleanup(now);

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  const allowed = bucket.count <= limit;
  const remaining = Math.max(0, limit - bucket.count);
  const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  return { allowed, remaining, retryAfterSeconds };
}

// Best-effort caller identity from standard proxy headers. Vercel sets
// x-forwarded-for; falls back to a shared bucket for local dev where
// there's no proxy in front of the dev server.
export function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'local-dev';
}
