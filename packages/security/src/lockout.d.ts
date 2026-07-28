export declare function recordFailedLogin(email: string): {
  isLocked: boolean;
  remainingAttempts: number;
  lockedUntil?: number;
};
export declare function isAccountLocked(email: string): {
  isLocked: boolean;
  lockedUntil?: number;
};
export declare function resetFailedLoginAttempts(email: string): void;
//# sourceMappingURL=lockout.d.ts.map
