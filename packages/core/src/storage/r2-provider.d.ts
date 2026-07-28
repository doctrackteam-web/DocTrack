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
export declare class CloudflareR2StorageProvider implements IStorageProvider {
  private config;
  private memoryCache;
  constructor(config?: Partial<CloudflareR2Config>);
  createPresignedUploadUrl(key: string, mimeType: string): Promise<PresignedUrlResult>;
  createPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  putObject(key: string, buffer: Buffer, mimeType: string): Promise<StorageObjectMetadata>;
  getObject(key: string): Promise<{
    data: Buffer;
    metadata: StorageObjectMetadata;
  }>;
  deleteObject(key: string): Promise<boolean>;
}
//# sourceMappingURL=r2-provider.d.ts.map
