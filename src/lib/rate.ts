// In-memory per-IP rate limiter. Acceptable for low-traffic single-user demo.
// Per warm Lambda, so not strict. Swap for Vercel KV / Upstash if abuse appears.

const buckets = new Map<string, { count: number; reset: number }>();

const WRITE_LIMIT = 60; // writes per hour per IP
const WINDOW_MS = 60 * 60 * 1000;

export function getClientKey(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "anon"
  );
}

export function checkWriteLimit(headers: Headers): { ok: boolean; remaining: number; resetMs: number } {
  const key = getClientKey(headers);
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + WINDOW_MS });
    return { ok: true, remaining: WRITE_LIMIT - 1, resetMs: WINDOW_MS };
  }
  if (bucket.count >= WRITE_LIMIT) {
    return { ok: false, remaining: 0, resetMs: bucket.reset - now };
  }
  bucket.count++;
  return { ok: true, remaining: WRITE_LIMIT - bucket.count, resetMs: bucket.reset - now };
}
