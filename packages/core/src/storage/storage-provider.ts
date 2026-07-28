import { createHash, randomBytes } from 'crypto';

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
  getObject(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }>;
  deleteObject(key: string): Promise<boolean>;
}

/**
 * Local / R2 / S3 Storage Provider Implementation
 */
export class LocalStorageProvider implements IStorageProvider {
  private store = new Map<string, { data: Buffer; metadata: StorageObjectMetadata }>();
  private bucket: string;

  constructor(bucket: string = 'doctrack-documents-dev') {
    this.bucket = bucket;
  }

  async createPresignedUploadUrl(key: string, mimeType: string): Promise<PresignedUrlResult> {
    const uploadUrl = `https://storage.doctrack.com/upload/${this.bucket}/${key}?signature=${randomBytes(16).toString('hex')}`;
    return {
      uploadUrl,
      fileKey: key,
      headers: { 'Content-Type': mimeType },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    };
  }

  async createPresignedDownloadUrl(key: string): Promise<string> {
    return `https://storage.doctrack.com/download/${this.bucket}/${key}?token=${randomBytes(16).toString('hex')}`;
  }

  async putObject(key: string, buffer: Buffer, mimeType: string): Promise<StorageObjectMetadata> {
    const etag = createHash('sha256').update(buffer).digest('hex');
    const metadata: StorageObjectMetadata = {
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

  async getObject(key: string): Promise<{ data: Buffer; metadata: StorageObjectMetadata }> {
    const item = this.store.get(key);
    if (!item) {
      throw new Error(`Object with key ${key} not found in storage.`);
    }
    return item;
  }

  async deleteObject(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
}
