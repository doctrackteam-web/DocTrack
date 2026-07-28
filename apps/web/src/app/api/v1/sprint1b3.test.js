"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const route_js_1 = require("./folders/route.js");
const route_js_2 = require("./search/route.js");
const route_js_3 = require("./dashboard/metrics/route.js");
(0, node_test_1.default)('Sprint 1B.3 Flow: Folders, Global Search & Dashboard Metrics', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearDocumentStoreForTesting)();
    (0, core_1.clearFolderStoreForTesting)();
    // 1. Setup User & Session
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('orguser@doctrack.com', 'SecurePass123!', 'Org User');
    // 2. Create Folder
    const folderReq = new Request('http://localhost/api/v1/folders', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Financial Reports 2026' }),
    });
    const folderRes = await (0, route_js_1.POST)(folderReq);
    node_assert_1.default.strictEqual(folderRes.status, 201);
    const folderBody = await folderRes.json();
    node_assert_1.default.strictEqual(folderBody.data.folder.name, 'Financial Reports 2026');
    // 3. Create Document
    (0, core_1.createDocumentStore)(workspace.id, user.id, 'Q3 Income Statement', 'workspaces/ws1/q3.pdf', 1048576);
    // 4. Test Global Search API
    const searchReq = new Request('http://localhost/api/v1/search?q=Financial', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawSessionToken}` },
    });
    const searchRes = await (0, route_js_2.GET)(searchReq);
    node_assert_1.default.strictEqual(searchRes.status, 200);
    const searchBody = await searchRes.json();
    node_assert_1.default.strictEqual(searchBody.data.results.length, 1);
    node_assert_1.default.strictEqual(searchBody.data.results[0].title, 'Financial Reports 2026');
    // 5. Test Owner Dashboard Metrics API
    const metricsReq = new Request('http://localhost/api/v1/dashboard/metrics', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawSessionToken}` },
    });
    const metricsRes = await (0, route_js_3.GET)(metricsReq);
    node_assert_1.default.strictEqual(metricsRes.status, 200);
    const metricsBody = await metricsRes.json();
    node_assert_1.default.strictEqual(metricsBody.data.metrics.totalDocuments, 1);
    node_assert_1.default.strictEqual(metricsBody.data.metrics.totalFolders, 1);
    node_assert_1.default.strictEqual(metricsBody.data.metrics.storageUsedMb, '1.00');
});
//# sourceMappingURL=sprint1b3.test.js.map