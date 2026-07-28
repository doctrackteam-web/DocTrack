"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
/**
 * AES-256 GCM encryption helper
 */
function encryptData(plainText, secretKey) {
    const key = Buffer.from(secretKey.padEnd(32, '0').slice(0, 32));
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
        encrypted,
        iv: iv.toString('hex'),
        tag,
    };
}
function decryptData(encrypted, iv, tag, secretKey) {
    const key = Buffer.from(secretKey.padEnd(32, '0').slice(0, 32));
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//# sourceMappingURL=crypto.js.map