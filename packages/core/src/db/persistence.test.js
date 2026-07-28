"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const index_js_1 = require("../index.js");
(0, node_test_1.default)('Production Persistence: Drizzle Database Schema Migrations', () => {
    const result = (0, index_js_1.runDatabaseMigrations)();
    node_assert_1.default.strictEqual(result.success, true);
    node_assert_1.default.ok(result.executedStatements > 0);
});
(0, node_test_1.default)('Production Infrastructure: Cloudflare R2 Storage Provider', async () => {
    const r2 = new index_js_1.CloudflareR2StorageProvider({
        bucketName: 'doctrack-test-r2-bucket',
    });
    const key = 'test/document.pdf';
    const buffer = Buffer.from('%PDF-1.4\nTest PDF content');
    // Put Object
    const meta = await r2.putObject(key, buffer, 'application/pdf');
    node_assert_1.default.strictEqual(meta.key, key);
    node_assert_1.default.strictEqual(meta.bucket, 'doctrack-test-r2-bucket');
    node_assert_1.default.ok(meta.etag);
    // Get Object
    const fetched = await r2.getObject(key);
    node_assert_1.default.strictEqual(fetched.data.toString(), buffer.toString());
    // Presigned URLs
    const uploadPresigned = await r2.createPresignedUploadUrl(key, 'application/pdf');
    node_assert_1.default.ok(uploadPresigned.uploadUrl.includes('cloudflarestorage.com'));
    const downloadPresigned = await r2.createPresignedDownloadUrl(key);
    node_assert_1.default.ok(downloadPresigned.includes('cloudflarestorage.com'));
    // Delete Object
    const deleted = await r2.deleteObject(key);
    node_assert_1.default.strictEqual(deleted, true);
});
//# sourceMappingURL=persistence.test.js.map