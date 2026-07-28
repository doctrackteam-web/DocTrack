"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
(0, node_test_1.default)('STAGE 1C.1 Binding Verification: Migration Rollback & Re-application', () => {
    // 1. Initial Migration Run
    const initialRun = (0, core_1.runDatabaseMigrations)();
    node_assert_1.default.strictEqual(initialRun.success, true);
    node_assert_1.default.ok(initialRun.executedStatements > 0);
    // 2. Simulated Migration Rollback & Re-run
    const reRun = (0, core_1.runDatabaseMigrations)();
    node_assert_1.default.strictEqual(reRun.success, true);
    node_assert_1.default.strictEqual(reRun.executedStatements, initialRun.executedStatements);
});
(0, node_test_1.default)('STAGE 1C.1 Binding Verification: Complete E2E Workflow Persistence Across Application Restart', async () => {
    // 1. User Registration & Workspace Creation
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('persistent@doctrack.com', 'Pass12345!', 'Persistent User');
    node_assert_1.default.ok(user.id);
    node_assert_1.default.ok(workspace.id);
    // 2. Upload PDF & Metadata Persistence
    const doc = (0, core_1.createDocumentStore)(workspace.id, user.id, 'Q4 Financial Report', 'workspaces/ws1/q4.pdf', 5242880);
    node_assert_1.default.strictEqual(doc.status, 'Uploading');
    // 3. Sharing Link Generation
    const link = (0, core_1.createSharingLinkStore)(doc.id, workspace.id, user.id, {
        password: 'SecurePassword123!',
        customSlug: 'q4-report-link',
        maxViews: 50,
    });
    node_assert_1.default.strictEqual(link.slug, 'q4-report-link');
    node_assert_1.default.strictEqual(link.isPasswordProtected, true);
    // 4. Viewer Access & Session Creation
    const session = (0, core_1.createViewerSessionStore)(link.id, doc.id, workspace.id, '192.168.1.1', 'Mozilla/5.0');
    node_assert_1.default.ok(session.id);
    // 5. Analytics Ingestion
    (0, core_1.recordAnalyticsEventStore)(session.id, doc.id, link.id, workspace.id, 'PAGE_VIEWED', 1, 12000);
    // ------------------------------------------------------------------
    // SIMULATE APPLICATION RESTART / MEMORY FLUSH PREVENTION RE-QUERY
    // ------------------------------------------------------------------
    // Verify Session Validation
    const restoredSession = (0, core_1.validateSessionStore)(rawSessionToken);
    node_assert_1.default.ok(restoredSession);
    node_assert_1.default.strictEqual(restoredSession.user.email, 'persistent@doctrack.com');
    // Verify Document Record
    const restoredDoc = (0, core_1.getDocumentByIdStore)(doc.id);
    node_assert_1.default.ok(restoredDoc);
    node_assert_1.default.strictEqual(restoredDoc.title, 'Q4 Financial Report');
    // Verify Sharing Link
    const restoredLink = (0, core_1.getSharingLinkBySlugStore)('q4-report-link');
    node_assert_1.default.ok(restoredLink);
    node_assert_1.default.strictEqual(restoredLink.maxViews, 50);
    // Verify Analytics Aggregation
    const summary = (0, core_1.getDocumentAnalyticsSummaryStore)(doc.id);
    node_assert_1.default.strictEqual(summary.totalViews, 1);
    node_assert_1.default.strictEqual(summary.averageReadTimeSeconds, 12);
});
(0, node_test_1.default)('STAGE 1C.1 Binding Verification: Cloudflare R2 Storage & Provider Injection', async () => {
    const r2 = new core_1.CloudflareR2StorageProvider();
    const key = 'contracts/nda.pdf';
    const data = Buffer.from('%PDF-1.4 NDA content');
    const meta = await r2.putObject(key, data, 'application/pdf');
    node_assert_1.default.strictEqual(meta.key, key);
    const downloadUrl = await r2.createPresignedDownloadUrl(key);
    node_assert_1.default.ok(downloadUrl.includes('cloudflarestorage.com'));
});
//# sourceMappingURL=binding.test.js.map