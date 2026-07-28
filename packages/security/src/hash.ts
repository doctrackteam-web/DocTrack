import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';

/**
 * Secure password hashing using PBKDF2 with SHA-512 and 100,000 iterations.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) return false;

  const keyBuffer = Buffer.from(originalHash, 'hex');
  const derivedKey = pbkdf2Sync(password, salt, 100000, 64, 'sha512');

  if (keyBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(keyBuffer, derivedKey);
}
