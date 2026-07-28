"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureToken = generateSecureToken;
exports.hashToken = hashToken;
const crypto_1 = require("crypto");
/**
 * Generate cryptographically secure random token (URL-safe string)
 */
function generateSecureToken(length = 32) {
    return (0, crypto_1.randomBytes)(length).toString('hex');
}
/**
 * Hash session tokens before storing in database (SHA-256)
 */
function hashToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
//# sourceMappingURL=tokens.js.map