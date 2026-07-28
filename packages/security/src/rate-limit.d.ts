export declare function checkRateLimit(
  key: string,
  maxRequests?: number,
  windowMs?: number,
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};
export declare function clearRateLimitStore(): void;
//# sourceMappingURL=rate-limit.d.ts.map
