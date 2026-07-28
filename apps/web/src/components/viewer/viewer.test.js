"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const EdgeDocumentViewer_js_1 = require("./EdgeDocumentViewer.js");
const route_js_1 = require("../../app/api/v1/view/stream/[token]/route.js");
const core_1 = require("@doctrack/core");
(0, node_test_1.default)('Edge Viewer Controller: Navigation, Zoom & Reading Analytics', () => {
    const viewer = new EdgeDocumentViewer_js_1.EdgeViewerController(10);
    let state = viewer.getState();
    node_assert_1.default.strictEqual(state.currentPage, 1);
    node_assert_1.default.strictEqual(state.totalPages, 10);
    node_assert_1.default.strictEqual(state.zoomLevel, 1.0);
    // Page Navigation
    viewer.nextPage();
    state = viewer.getState();
    node_assert_1.default.strictEqual(state.currentPage, 2);
    node_assert_1.default.strictEqual(state.scrollDepthPercent, 20);
    viewer.previousPage();
    state = viewer.getState();
    node_assert_1.default.strictEqual(state.currentPage, 1);
    // Zoom Controls
    viewer.setZoom(1.5);
    state = viewer.getState();
    node_assert_1.default.strictEqual(state.zoomLevel, 1.5);
    node_assert_1.default.strictEqual(state.fitMode, 'custom');
    // Idle Detection Test
    const futureTime = Date.now() + 15000; // 15 seconds later
    const isIdle = viewer.checkIdleState(futureTime);
    node_assert_1.default.strictEqual(isIdle, true);
});
(0, node_test_1.default)('Secure Streaming API: Headers & Anti-Hotlinking', async () => {
    (0, core_1.clearStoreForTesting)();
    const { rawSessionToken } = (0, core_1.registerUserStore)('streamuser@doctrack.com', 'Pass12345!', 'Stream User');
    const req = new Request(`http://localhost/api/v1/view/stream/${rawSessionToken}`, {
        method: 'GET',
    });
    const res = await (0, route_js_1.GET)(req, { params: { token: rawSessionToken } });
    node_assert_1.default.strictEqual(res.status, 200);
    node_assert_1.default.strictEqual(res.headers.get('Content-Type'), 'application/pdf');
    node_assert_1.default.strictEqual(res.headers.get('Cache-Control'), 'private, no-store, no-cache, must-revalidate');
    node_assert_1.default.strictEqual(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
});
//# sourceMappingURL=viewer.test.js.map