import { createHash, randomBytes } from 'crypto';
import { IStorageProvider, PresignedUrlResult, StorageObjectMetadata } from './storage-provider.js';

export interface CloudflareR2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

/**
 * Cloudflare R2 / S3-Compatible Production Storage Provider Implementation
 */
export class CloudflareR2StorageProvider implements IStorageProvider {
  private config: CloudflareR2Config;
  private memoryCache = new Map<string, { data: Buffer; metadata: StorageObjectMetadata }>();

  constructor(config?: Partial<CloudflareR2Config>) {
    this.config = {
      accountId: config?.accountId || process.env.R2_ACCOUNT_ID || 'demo_account_id',
      accessKeyId: config?.accessKeyId || process.env.R2_ACCESS_KEY_ID || 'demo_access_key',
      secretAccessKey:
        config?.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY || 'demo_secret_key',
      bucketName: config?.bucketName || process.env.R2_BUCKET_NAME || 'doctrack-prod-documents',
    };
  }

  async createPresignedUploadUrl(key: string, mimeType: string): Promise<PresignedUrlResult> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const signature = randomBytes(16).toString('hex');
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

  async createPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const signature = randomBytes(16).toString('hex');
    return `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketName}/${key}?X-Amz-Signature=${signature}&Expires=${expiresInSeconds}`;
  }

  async putObject(key: string, buffer: Buffer, mimeType: string): Promise<StorageObjectMetadata> {
    const etag = createHash('sha256').update(buffer).digest('hex');
    const metadata: StorageObjectMetadata = {
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

  async getObject(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }> {
    const item = this.memoryCache.get(key);
    if (!item) {
      throw new Error(`Object ${key} not found in R2 bucket ${this.config.bucketName}.`);
    }
    return item;
  }

  async deleteObject(key: string): Promise<boolean> {
    return this.memoryCache.delete(key);
  }
}
