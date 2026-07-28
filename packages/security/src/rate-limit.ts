/**
 * In-memory sliding-window Rate Limiter for IP and Account protection.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry = { count: 1, resetAt: now + windowMs };
    rateLimitStore.set(key, newEntry);
    return { allowed: true, remaining: maxRequests - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function clearRateLimitStore(): void {
  rateLimitStore.clear();
}
