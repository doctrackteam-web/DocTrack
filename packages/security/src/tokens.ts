import { randomBytes, createHash } from 'crypto';

/**
 * Generate cryptographically secure random token (URL-safe string)
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash session tokens before storing in database (SHA-256)
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
