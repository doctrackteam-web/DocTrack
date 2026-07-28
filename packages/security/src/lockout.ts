/**
 * Brute force protection & account lockout helper.
 * Locks account after 5 consecutive failed login attempts for 15 minutes.
 */
interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
}

const lockoutStore = new Map<string, LockoutState>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function recordFailedLogin(email: string): {
  isLocked: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
} {
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

export function isAccountLocked(email: string): { isLocked: boolean; lockedUntil?: number } {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();
  const state = lockoutStore.get(normalizedEmail);

  if (!state) return { isLocked: false };

  if (state.lockedUntil) {
    if (now > state.lockedUntil) {
      lockoutStore.delete(normalizedEmail);
      return { isLocked: false };
    }
    return { isLocked: true, lockedUntil: state.lockedUntil };
  }

  return { isLocked: false };
}

export function resetFailedLoginAttempts(email: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  lockoutStore.delete(normalizedEmail);
}
