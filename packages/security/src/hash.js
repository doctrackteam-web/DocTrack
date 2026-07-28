"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = require("crypto");
/**
 * Secure password hashing using PBKDF2 with SHA-512 and 100,000 iterations.
 */
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const hash = (0, crypto_1.pbkdf2Sync)(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash)
        return false;
    const keyBuffer = Buffer.from(originalHash, 'hex');
    const derivedKey = (0, crypto_1.pbkdf2Sync)(password, salt, 100000, 64, 'sha512');
    if (keyBuffer.length !== derivedKey.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(keyBuffer, derivedKey);
}
//# sourceMappingURL=hash.js.map