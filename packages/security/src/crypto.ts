import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * AES-256 GCM encryption helper
 */
export function encryptData(
  plainText: string,
  secretKey: string,
): { encrypted: string; iv: string; tag: string } {
  const key = Buffer.from(secretKey.padEnd(32, '0').slice(0, 32));
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

export function decryptData(encrypted: string, iv: string, tag: string, secretKey: string): string {
  const key = Buffer.from(secretKey.padEnd(32, '0').slice(0, 32));
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
