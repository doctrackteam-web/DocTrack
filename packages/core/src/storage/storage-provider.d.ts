export interface StorageObjectMetadata {
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
  etag: string;
  lastModified: Date;
}
export interface PresignedUrlResult {
  uploadUrl: string;
  fileKey: string;
  headers: Record<string, string>;
  expiresAt: Date;
}
export interface IStorageProvider {
  createPresignedUploadUrl(
    key: string,
    mimeType: string,
    maxSizeBytes?: number,
  ): Promise<PresignedUrlResult>;
  createPresignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  putObject(key: string, buffer: Buffer, mimeType: string): Promise<StorageObjectMetadata>;
  getObject(key: string): Promise<{
    data: Buffer;
    metadata: StorageObjectMetadata;
  }>;
  deleteObject(key: string): Promise<boolean>;
}
/**
 * Local / R2 / S3 Storage Provider Implementation
 */
export declare class LocalStorageProvider implements IStorageProvider {
  private store;
  private bucket;
  constructor(bucket?: string);
  createPresignedUploadUrl(key: string, mimeType: string): Promise<PresignedUrlResult>;
  createPresignedDownloadUrl(key: string): Promise<string>;
  putObject(key: string, buffer: Buffer, mimeType: string): Promise<StorageObjectMetadata>;
  getObject(key: string): Promise<{
    data: Buffer;
    metadata: StorageObjectMetadata;
  }>;
  deleteObject(key: string): Promise<boolean>;
}
//# sourceMappingURL=storage-provider.d.ts.map
