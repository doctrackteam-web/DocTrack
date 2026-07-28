"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.clearRateLimitStore = clearRateLimitStore;
const rateLimitStore = new Map();
function checkRateLimit(key, maxRequests = 5, windowMs = 60000) {
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
function clearRateLimitStore() {
    rateLimitStore.clear();
}
//# sourceMappingURL=rate-limit.js.map