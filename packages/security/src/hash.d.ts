/**
 * Secure password hashing using PBKDF2 with SHA-512 and 100,000 iterations.
 */
export declare function hashPassword(password: string): string;
export declare function verifyPassword(password: string, storedHash: string): boolean;
//# sourceMappingURL=hash.d.ts.map
