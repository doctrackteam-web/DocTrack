import test from 'node:test';
import assert from 'node:assert';
import { runDatabaseMigrations, CloudflareR2StorageProvider } from '../index.js';

test('Production Persistence: Drizzle Database Schema Migrations', () => {
  const result = runDatabaseMigrations();
  assert.strictEqual(result.success, true);
  assert.ok(result.executedStatements > 0);
});

test('Production Infrastructure: Cloudflare R2 Storage Provider', async () => {
  const r2 = new CloudflareR2StorageProvider({
    bucketName: 'doctrack-test-r2-bucket',
  });

  const key = 'test/document.pdf';
  const buffer = Buffer.from('%PDF-1.4\nTest PDF content');

  // Put Object
  const meta = await r2.putObject(key, buffer, 'application/pdf');
  assert.strictEqual(meta.key, key);
  assert.strictEqual(meta.bucket, 'doctrack-test-r2-bucket');
  assert.ok(meta.etag);

  // Get Object
  const fetched = await r2.getObject(key);
  assert.strictEqual(fetched.data.toString(), buffer.toString());

  // Presigned URLs
  const uploadPresigned = await r2.createPresignedUploadUrl(key, 'application/pdf');
  assert.ok(uploadPresigned.uploadUrl.includes('cloudflarestorage.com'));

  const downloadPresigned = await r2.createPresignedDownloadUrl(key);
  assert.ok(downloadPresigned.includes('cloudflarestorage.com'));

  // Delete Object
  const deleted = await r2.deleteObject(key);
  assert.strictEqual(deleted, true);
});
