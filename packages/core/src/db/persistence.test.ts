import test from 'node:test';
import assert from 'node:assert';
import { runDatabaseMigrations, SupabaseStorageProvider } from '../index.js';

test('Production Persistence: Drizzle Database Schema Migrations', () => {
  const result = runDatabaseMigrations();
  assert.strictEqual(result.success, true);
  assert.ok(result.executedStatements > 0);
});

test('Production Infrastructure: Supabase Storage Provider', async () => {
  const storage = new SupabaseStorageProvider({
    bucketName: 'doctrack-test-storage-bucket',
  });

  const key = 'test/document.pdf';
  const buffer = Buffer.from('%PDF-1.4\nTest PDF content');

  // Put Object
  const meta = await storage.putObject(key, buffer, 'application/pdf');
  assert.strictEqual(meta.key, key);
  assert.strictEqual(meta.bucket, 'doctrack-test-storage-bucket');
  assert.ok(meta.etag);

  // Get Object
  const fetched = await storage.getObject(key);
  assert.strictEqual(fetched.data.toString(), buffer.toString());

  // Presigned URLs
  const uploadPresigned = await storage.createPresignedUploadUrl(key, 'application/pdf');
  assert.ok(uploadPresigned.uploadUrl.includes('/storage/v1/object/upload/sign/'));

  const downloadPresigned = await storage.createPresignedDownloadUrl(key);
  assert.ok(downloadPresigned.includes('/storage/v1/object/sign/'));

  // Delete Object
  const deleted = await storage.deleteObject(key);
  assert.strictEqual(deleted, true);
});
