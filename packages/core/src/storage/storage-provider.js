"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const crypto_1 = require("crypto");
/**
 * Local / R2 / S3 Storage Provider Implementation
 */
class LocalStorageProvider {
    store = new Map();
    bucket;
    constructor(bucket = 'doctrack-documents-dev') {
        this.bucket = bucket;
    }
    async createPresignedUploadUrl(key, mimeType) {
        const uploadUrl = `https://storage.doctrack.com/upload/${this.bucket}/${key}?signature=${(0, crypto_1.randomBytes)(16).toString('hex')}`;
        return {
            uploadUrl,
            fileKey: key,
            headers: { 'Content-Type': mimeType },
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        };
    }
    async createPresignedDownloadUrl(key) {
        return `https://storage.doctrack.com/download/${this.bucket}/${key}?token=${(0, crypto_1.randomBytes)(16).toString('hex')}`;
    }
    async putObject(key, buffer, mimeType) {
        const etag = (0, crypto_1.createHash)('sha256').update(buffer).digest('hex');
        const metadata = {
            key,
            bucket: this.bucket,
            size: buffer.length,
            mimeType,
            etag,
            lastModified: new Date(),
        };
        this.store.set(key, { data: buffer, metadata });
        return metadata;
    }
    async getObject(key) {
        const item = this.store.get(key);
        if (!item) {
            throw new Error(`Object with key ${key} not found in storage.`);
        }
        return item;
    }
    async deleteObject(key) {
        return this.store.delete(key);
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=storage-provider.js.map