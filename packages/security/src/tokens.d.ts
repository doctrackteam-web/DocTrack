/**
 * Generate cryptographically secure random token (URL-safe string)
 */
export declare function generateSecureToken(length?: number): string;
/**
 * Hash session tokens before storing in database (SHA-256)
 */
export declare function hashToken(token: string): string;
//# sourceMappingURL=tokens.d.ts.map
