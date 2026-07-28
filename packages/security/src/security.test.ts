import test from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword } from './hash.js';
import { generateSecureToken, hashToken } from './tokens.js';
import { encryptData, decryptData } from './crypto.js';
import { checkRateLimit, clearRateLimitStore } from './rate-limit.js';
import { recordFailedLogin, isAccountLocked, resetFailedLoginAttempts } from './lockout.js';

test('PBKDF2 Password Hashing & Verification', () => {
  const password = 'SuperSecurePassword123!';
  const hashedPassword = hashPassword(password);

  assert.notStrictEqual(hashedPassword, password);
  assert.strictEqual(verifyPassword(password, hashedPassword), true);
  assert.strictEqual(verifyPassword('WrongPassword', hashedPassword), false);
});

test('Secure Token Generation & Hashing', () => {
  const token = generateSecureToken(32);
  const tokenHash = hashToken(token);

  assert.strictEqual(token.length, 64);
  assert.strictEqual(tokenHash.length, 64);
  assert.notStrictEqual(token, tokenHash);
});

test('AES-256 GCM Encryption & Decryption', () => {
  const secretKey = '12345678901234567890123456789012';
  const plainText = 'Sensitive Document Secret Data Payload';

  const { encrypted, iv, tag } = encryptData(plainText, secretKey);
  const decrypted = decryptData(encrypted, iv, tag, secretKey);

  assert.strictEqual(decrypted, plainText);
});

test('Rate Limiter (Sliding Window)', () => {
  clearRateLimitStore();
  const key = 'test-ip-127.0.0.1';

  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(key, 5, 10000);
    assert.strictEqual(res.allowed, true);
  }

  const blockedRes = checkRateLimit(key, 5, 10000);
  assert.strictEqual(blockedRes.allowed, false);
});

test('Account Lockout (Brute Force Protection)', () => {
  const email = 'victim@example.com';
  resetFailedLoginAttempts(email);

  assert.strictEqual(isAccountLocked(email).isLocked, false);

  for (let i = 1; i <= 4; i++) {
    const result = recordFailedLogin(email);
    assert.strictEqual(result.isLocked, false);
    assert.strictEqual(result.remainingAttempts, 5 - i);
  }

  const lockoutResult = recordFailedLogin(email);
  assert.strictEqual(lockoutResult.isLocked, true);
  assert.strictEqual(isAccountLocked(email).isLocked, true);

  resetFailedLoginAttempts(email);
  assert.strictEqual(isAccountLocked(email).isLocked, false);
});
