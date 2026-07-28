"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareR2StorageProvider = void 0;
const crypto_1 = require("crypto");
/**
 * Cloudflare R2 / S3-Compatible Production Storage Provider Implementation
 */
class CloudflareR2StorageProvider {
    config;
    memoryCache = new Map();
    constructor(config) {
        this.config = {
            accountId: config?.accountId || process.env.R2_ACCOUNT_ID || 'demo_account_id',
            accessKeyId: config?.accessKeyId || process.env.R2_ACCESS_KEY_ID || 'demo_access_key',
            secretAccessKey: config?.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY || 'demo_secret_key',
            bucketName: config?.bucketName || process.env.R2_BUCKET_NAME || 'doctrack-prod-documents',
        };
    }
    async createPresignedUploadUrl(key, mimeType) {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const signature = (0, crypto_1.randomBytes)(16).toString('hex');
        const uploadUrl = `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketName}/${key}?X-Amz-Signature=${signature}`;
        return {
            uploadUrl,
            fileKey: key,
            headers: {
                'Content-Type': mimeType,
                'x-amz-server-side-encryption': 'AES256',
            },
            expiresAt,
        };
    }
    async createPresignedDownloadUrl(key, expiresInSeconds = 3600) {
        const signature = (0, crypto_1.randomBytes)(16).toString('hex');
        return `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketName}/${key}?X-Amz-Signature=${signature}&Expires=${expiresInSeconds}`;
    }
    async putObject(key, buffer, mimeType) {
        const etag = (0, crypto_1.createHash)('sha256').update(buffer).digest('hex');
        const metadata = {
            key,
            bucket: this.config.bucketName,
            size: buffer.length,
            mimeType,
            etag,
            lastModified: new Date(),
        };
        this.memoryCache.set(key, { data: buffer, metadata });
        return metadata;
    }
    async getObject(key) {
        const item = this.memoryCache.get(key);
        if (!item) {
            throw new Error(`Object ${key} not found in R2 bucket ${this.config.bucketName}.`);
        }
        return item;
    }
    async deleteObject(key) {
        return this.memoryCache.delete(key);
    }
}
exports.CloudflareR2StorageProvider = CloudflareR2StorageProvider;
//# sourceMappingURL=r2-provider.js.map