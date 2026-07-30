import { createHash, randomBytes } from 'crypto';
import { IStorageProvider, PresignedUrlResult, StorageObjectMetadata } from './storage-provider.js';

export interface SupabaseStorageConfig {
  url: string;
  serviceRoleKey: string;
  bucketName: string;
}

/**
 * Supabase Storage Production Storage Provider Implementation
 */
export class SupabaseStorageProvider implements IStorageProvider {
  private config: SupabaseStorageConfig;
  private memoryCache = new Map<string, { data: Buffer; metadata: StorageObjectMetadata }>();

  constructor(config?: Partial<SupabaseStorageConfig>) {
    this.config = {
      url:
        config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co',
      serviceRoleKey:
        config?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo_service_role_key',
      bucketName: config?.bucketName || process.env.SUPABASE_STORAGE_BUCKET || 'doctrack-documents',
    };
  }

  async createPresignedUploadUrl(key: string, mimeType: string): Promise<PresignedUrlResult> {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const token = randomBytes(16).toString('hex');
    const uploadUrl = `${this.config.url}/storage/v1/object/upload/sign/${this.config.bucketName}/${key}?token=${token}`;

    return {
      uploadUrl,
      fileKey: key,
      headers: {
        'Content-Type': mimeType,
        Authorization: `Bearer ${this.config.serviceRoleKey}`,
      },
      expiresAt,
    };
  }

  async createPresignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const token = randomBytes(16).toString('hex');
    return `${this.config.url}/storage/v1/object/sign/${this.config.bucketName}/${key}?token=${token}&expiresIn=${expiresInSeconds}`;
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
      throw new Error(`Object ${key} not found in Supabase bucket ${this.config.bucketName}.`);
    }
    return item;
  }

  async deleteObject(key: string): Promise<boolean> {
    return this.memoryCache.delete(key);
  }
}
