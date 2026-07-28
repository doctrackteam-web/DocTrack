"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const security_1 = require("@doctrack/security");
const route_js_1 = require("./route.js");
const route_js_2 = require("../view/access/route.js");
const route_js_3 = require("../analytics/event/route.js");
(0, node_test_1.default)('Sprint 1B.1 Core Flow: Generate Password Link -> Viewer Access -> Analytics Ingestion', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearDocumentStoreForTesting)();
    (0, core_1.clearLinkStoreForTesting)();
    (0, core_1.clearAnalyticsStoreForTesting)();
    (0, security_1.clearRateLimitStore)();
    // 1. Setup User & Document
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('share@doctrack.com', 'Pass12345!', 'Share User');
    const doc = (0, core_1.createDocumentStore)(workspace.id, user.id, 'Series A Pitch Deck', 'key_deck.pdf', 2048576);
    // 2. Generate Password-Protected Sharing Link
    const linkReq = new Request('http://localhost/api/v1/links', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId: doc.id,
            password: 'InvestorPassword123!',
            customSlug: 'series-a-deck',
            maxViews: 10,
        }),
    });
    const linkRes = await (0, route_js_1.POST)(linkReq);
    node_assert_1.default.strictEqual(linkRes.status, 201);
    const linkBody = await linkRes.json();
    node_assert_1.default.strictEqual(linkBody.data.link.slug, 'series-a-deck');
    node_assert_1.default.strictEqual(linkBody.data.link.isPasswordProtected, true);
    // 3. Attempt Access Without Password -> Expect 401 PASSWORD_REQUIRED
    const noPassReq = new Request('http://localhost/api/v1/view/access', {
        method: 'POST',
        body: JSON.stringify({ slug: 'series-a-deck' }),
    });
    const noPassRes = await (0, route_js_2.POST)(noPassReq);
    node_assert_1.default.strictEqual(noPassRes.status, 401);
    // 4. Access With Correct Password -> Expect 200 & Session ID
    const validAccessReq = new Request('http://localhost/api/v1/view/access', {
        method: 'POST',
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        body: JSON.stringify({ slug: 'series-a-deck', password: 'InvestorPassword123!' }),
    });
    const validAccessRes = await (0, route_js_2.POST)(validAccessReq);
    node_assert_1.default.strictEqual(validAccessRes.status, 200);
    const accessBody = await validAccessRes.json();
    const sessionId = accessBody.data.sessionId;
    node_assert_1.default.ok(sessionId);
    // 5. Ingest Page-Turn & Time-on-Page Analytics Events
    const eventReq = new Request('http://localhost/api/v1/analytics/event', {
        method: 'POST',
        body: JSON.stringify({
            sessionId,
            documentId: doc.id,
            linkId: linkBody.data.link.id,
            workspaceId: workspace.id,
            eventType: 'PAGE_VIEWED',
            pageNumber: 1,
            durationMs: 4500,
        }),
    });
    const eventRes = await (0, route_js_3.POST)(eventReq);
    node_assert_1.default.strictEqual(eventRes.status, 201);
});
//# sourceMappingURL=links.test.js.map