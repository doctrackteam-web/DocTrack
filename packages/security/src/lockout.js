"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordFailedLogin = recordFailedLogin;
exports.isAccountLocked = isAccountLocked;
exports.resetFailedLoginAttempts = resetFailedLoginAttempts;
const lockoutStore = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
function recordFailedLogin(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    let state = lockoutStore.get(normalizedEmail);
    if (!state || (state.lockedUntil && now > state.lockedUntil)) {
        state = { failedAttempts: 0, lockedUntil: null };
    }
    state.failedAttempts += 1;
    if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
        state.lockedUntil = now + LOCKOUT_DURATION_MS;
        lockoutStore.set(normalizedEmail, state);
        return { isLocked: true, remainingAttempts: 0, lockedUntil: state.lockedUntil };
    }
    lockoutStore.set(normalizedEmail, state);
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - state.failedAttempts };
}
function isAccountLocked(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const now = Date.now();
    const state = lockoutStore.get(normalizedEmail);
    if (!state)
        return { isLocked: false };
    if (state.lockedUntil) {
        if (now > state.lockedUntil) {
            lockoutStore.delete(normalizedEmail);
            return { isLocked: false };
        }
        return { isLocked: true, lockedUntil: state.lockedUntil };
    }
    return { isLocked: false };
}
function resetFailedLoginAttempts(email) {
    const normalizedEmail = email.toLowerCase().trim();
    lockoutStore.delete(normalizedEmail);
}
//# sourceMappingURL=lockout.js.map