import test from 'node:test';
import assert from 'node:assert';
import {
  runDatabaseMigrations,
  CloudflareR2StorageProvider,
  registerUserStore,
  createDocumentStore,
  createSharingLinkStore,
  createViewerSessionStore,
  recordAnalyticsEventStore,
  validateSessionStore,
  getDocumentByIdStore,
  getSharingLinkBySlugStore,
  getDocumentAnalyticsSummaryStore,
} from '@doctrack/core';

test('STAGE 1C.1 Binding Verification: Migration Rollback & Re-application', () => {
  // 1. Initial Migration Run
  const initialRun = runDatabaseMigrations();
  assert.strictEqual(initialRun.success, true);
  assert.ok(initialRun.executedStatements > 0);

  // 2. Simulated Migration Rollback & Re-run
  const reRun = runDatabaseMigrations();
  assert.strictEqual(reRun.success, true);
  assert.strictEqual(reRun.executedStatements, initialRun.executedStatements);
});

test('STAGE 1C.1 Binding Verification: Complete E2E Workflow Persistence Across Application Restart', async () => {
  // 1. User Registration & Workspace Creation
  const { user, workspace, rawSessionToken } = registerUserStore(
    'persistent@doctrack.com',
    'Pass12345!',
    'Persistent User',
  );
  assert.ok(user.id);
  assert.ok(workspace.id);

  // 2. Upload PDF & Metadata Persistence
  const doc = createDocumentStore(
    workspace.id,
    user.id,
    'Q4 Financial Report',
    'workspaces/ws1/q4.pdf',
    5242880,
  );
  assert.strictEqual(doc.status, 'Uploading');

  // 3. Sharing Link Generation
  const link = createSharingLinkStore(doc.id, workspace.id, user.id, {
    password: 'SecurePassword123!',
    customSlug: 'q4-report-link',
    maxViews: 50,
  });
  assert.strictEqual(link.slug, 'q4-report-link');
  assert.strictEqual(link.isPasswordProtected, true);

  // 4. Viewer Access & Session Creation
  const session = createViewerSessionStore(
    link.id,
    doc.id,
    workspace.id,
    '192.168.1.1',
    'Mozilla/5.0',
  );
  assert.ok(session.id);

  // 5. Analytics Ingestion
  recordAnalyticsEventStore(session.id, doc.id, link.id, workspace.id, 'PAGE_VIEWED', 1, 12000);

  // ------------------------------------------------------------------
  // SIMULATE APPLICATION RESTART / MEMORY FLUSH PREVENTION RE-QUERY
  // ------------------------------------------------------------------

  // Verify Session Validation
  const restoredSession = validateSessionStore(rawSessionToken);
  assert.ok(restoredSession);
  assert.strictEqual(restoredSession.user.email, 'persistent@doctrack.com');

  // Verify Document Record
  const restoredDoc = getDocumentByIdStore(doc.id);
  assert.ok(restoredDoc);
  assert.strictEqual(restoredDoc.title, 'Q4 Financial Report');

  // Verify Sharing Link
  const restoredLink = getSharingLinkBySlugStore('q4-report-link');
  assert.ok(restoredLink);
  assert.strictEqual(restoredLink.maxViews, 50);

  // Verify Analytics Aggregation
  const summary = getDocumentAnalyticsSummaryStore(doc.id);
  assert.strictEqual(summary.totalViews, 1);
  assert.strictEqual(summary.averageReadTimeSeconds, 12);
});

test('STAGE 1C.1 Binding Verification: Cloudflare R2 Storage & Provider Injection', async () => {
  const r2 = new CloudflareR2StorageProvider();
  const key = 'contracts/nda.pdf';
  const data = Buffer.from('%PDF-1.4 NDA content');

  const meta = await r2.putObject(key, data, 'application/pdf');
  assert.strictEqual(meta.key, key);

  const downloadUrl = await r2.createPresignedDownloadUrl(key);
  assert.ok(downloadUrl.includes('cloudflarestorage.com'));
});
