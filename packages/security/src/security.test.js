"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const hash_js_1 = require("./hash.js");
const tokens_js_1 = require("./tokens.js");
const crypto_js_1 = require("./crypto.js");
const rate_limit_js_1 = require("./rate-limit.js");
const lockout_js_1 = require("./lockout.js");
(0, node_test_1.default)('PBKDF2 Password Hashing & Verification', () => {
    const password = 'SuperSecurePassword123!';
    const hashedPassword = (0, hash_js_1.hashPassword)(password);
    node_assert_1.default.notStrictEqual(hashedPassword, password);
    node_assert_1.default.strictEqual((0, hash_js_1.verifyPassword)(password, hashedPassword), true);
    node_assert_1.default.strictEqual((0, hash_js_1.verifyPassword)('WrongPassword', hashedPassword), false);
});
(0, node_test_1.default)('Secure Token Generation & Hashing', () => {
    const token = (0, tokens_js_1.generateSecureToken)(32);
    const tokenHash = (0, tokens_js_1.hashToken)(token);
    node_assert_1.default.strictEqual(token.length, 64);
    node_assert_1.default.strictEqual(tokenHash.length, 64);
    node_assert_1.default.notStrictEqual(token, tokenHash);
});
(0, node_test_1.default)('AES-256 GCM Encryption & Decryption', () => {
    const secretKey = '12345678901234567890123456789012';
    const plainText = 'Sensitive Document Secret Data Payload';
    const { encrypted, iv, tag } = (0, crypto_js_1.encryptData)(plainText, secretKey);
    const decrypted = (0, crypto_js_1.decryptData)(encrypted, iv, tag, secretKey);
    node_assert_1.default.strictEqual(decrypted, plainText);
});
(0, node_test_1.default)('Rate Limiter (Sliding Window)', () => {
    (0, rate_limit_js_1.clearRateLimitStore)();
    const key = 'test-ip-127.0.0.1';
    for (let i = 0; i < 5; i++) {
        const res = (0, rate_limit_js_1.checkRateLimit)(key, 5, 10000);
        node_assert_1.default.strictEqual(res.allowed, true);
    }
    const blockedRes = (0, rate_limit_js_1.checkRateLimit)(key, 5, 10000);
    node_assert_1.default.strictEqual(blockedRes.allowed, false);
});
(0, node_test_1.default)('Account Lockout (Brute Force Protection)', () => {
    const email = 'victim@example.com';
    (0, lockout_js_1.resetFailedLoginAttempts)(email);
    node_assert_1.default.strictEqual((0, lockout_js_1.isAccountLocked)(email).isLocked, false);
    for (let i = 1; i <= 4; i++) {
        const result = (0, lockout_js_1.recordFailedLogin)(email);
        node_assert_1.default.strictEqual(result.isLocked, false);
        node_assert_1.default.strictEqual(result.remainingAttempts, 5 - i);
    }
    const lockoutResult = (0, lockout_js_1.recordFailedLogin)(email);
    node_assert_1.default.strictEqual(lockoutResult.isLocked, true);
    node_assert_1.default.strictEqual((0, lockout_js_1.isAccountLocked)(email).isLocked, true);
    (0, lockout_js_1.resetFailedLoginAttempts)(email);
    node_assert_1.default.strictEqual((0, lockout_js_1.isAccountLocked)(email).isLocked, false);
});
//# sourceMappingURL=security.test.js.map