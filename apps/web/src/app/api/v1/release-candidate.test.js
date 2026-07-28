"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const security_1 = require("@doctrack/security");
// Route Handlers
const route_js_1 = require("./auth/register/route.js");
const route_js_2 = require("./documents/upload/route.js");
const route_js_3 = require("./documents/complete/route.js");
const route_js_4 = require("./links/route.js");
const route_js_5 = require("./view/access/route.js");
const route_js_6 = require("./analytics/event/route.js");
const route_js_7 = require("./signatures/request/route.js");
const route_js_8 = require("./signatures/sign/route.js");
const route_js_9 = require("./signatures/certificate/[id]/route.js");
const route_js_10 = require("./billing/subscription/route.js");
(0, node_test_1.default)('Release Candidate (RC-1) E2E User Journey Verification', async () => {
    process.env.BILLING_ENABLED = 'true';
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearDocumentStoreForTesting)();
    (0, core_1.clearLinkStoreForTesting)();
    (0, core_1.clearAnalyticsStoreForTesting)();
    (0, core_1.clearSignatureStoreForTesting)();
    (0, core_1.clearBillingStoreForTesting)();
    (0, security_1.clearRateLimitStore)();
    // 1. User Registration & Default Workspace Auto-Provisioning
    const regReq = new Request('http://localhost/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'rc1_user@doctrack.com',
            password: 'RC1_SecurePassword123!',
            name: 'Release Candidate User',
        }),
    });
    const regRes = await (0, route_js_1.POST)(regReq);
    node_assert_1.default.strictEqual(regRes.status, 201);
    const regBody = await regRes.json();
    const rawToken = regBody.data.sessionToken;
    node_assert_1.default.ok(rawToken);
    // 2. Upload PDF Document Initiation
    const uploadReq = new Request('http://localhost/api/v1/documents/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Master Service Agreement 2026',
            fileName: 'msa_2026.pdf',
            fileSize: 3145728,
            mimeType: 'application/pdf',
        }),
    });
    const uploadRes = await (0, route_js_2.POST)(uploadReq);
    node_assert_1.default.strictEqual(uploadRes.status, 201);
    const uploadBody = await uploadRes.json();
    const documentId = uploadBody.data.documentId;
    node_assert_1.default.ok(documentId);
    // 3. Complete PDF Upload & Trigger Sandboxed Inspection
    const completeReq = new Request('http://localhost/api/v1/documents/complete', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
    });
    const completeRes = await (0, route_js_3.POST)(completeReq);
    node_assert_1.default.strictEqual(completeRes.status, 200);
    // 4. Generate Password-Protected Sharing Link
    const linkReq = new Request('http://localhost/api/v1/links', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId,
            password: 'ClientAccessPass123!',
            customSlug: 'msa-2026-link',
            maxViews: 20,
        }),
    });
    const linkRes = await (0, route_js_4.POST)(linkReq);
    node_assert_1.default.strictEqual(linkRes.status, 201);
    const linkBody = await linkRes.json();
    node_assert_1.default.strictEqual(linkBody.data.link.slug, 'msa-2026-link');
    // 5. Open Edge Viewer & Initialize Session
    const accessReq = new Request('http://localhost/api/v1/view/access', {
        method: 'POST',
        body: JSON.stringify({ slug: 'msa-2026-link', password: 'ClientAccessPass123!' }),
    });
    const accessRes = await (0, route_js_5.POST)(accessReq);
    node_assert_1.default.strictEqual(accessRes.status, 200);
    const accessBody = await accessRes.json();
    const sessionId = accessBody.data.sessionId;
    // 6. Record Page Analytics
    const eventReq = new Request('http://localhost/api/v1/analytics/event', {
        method: 'POST',
        body: JSON.stringify({
            sessionId,
            documentId,
            linkId: linkBody.data.link.id,
            eventType: 'PAGE_VIEWED',
            pageNumber: 1,
            durationMs: 8500,
        }),
    });
    const eventRes = await (0, route_js_6.POST)(eventReq);
    node_assert_1.default.strictEqual(eventRes.status, 201);
    // 7. Signature Request Creation & Execution
    const sigReqPayload = new Request('http://localhost/api/v1/signatures/request', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId,
            title: 'Master Service Agreement 2026',
            participants: [{ email: 'client@enterprise.com', name: 'Enterprise Client' }],
            fields: [
                {
                    page: 1,
                    x: 100,
                    y: 500,
                    width: 200,
                    height: 50,
                    required: true,
                    fieldType: 'signature',
                    assignedSignerEmail: 'client@enterprise.com',
                },
            ],
        }),
    });
    const sigReqRes = await (0, route_js_7.POST)(sigReqPayload);
    node_assert_1.default.strictEqual(sigReqRes.status, 201);
    const sigReqBody = await sigReqRes.json();
    const signerToken = sigReqBody.data.signerLinks[0].url.split('/sign/')[1];
    // Submit Signature
    const signReq = new Request('http://localhost/api/v1/signatures/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: signerToken,
            fieldValues: [{ fieldId: 'fld_1', value: 'data:image/png;base64,signature_data' }],
        }),
    });
    const signRes = await (0, route_js_8.POST)(signReq);
    node_assert_1.default.strictEqual(signRes.status, 200);
    const signBody = await signRes.json();
    const certId = signBody.data.certificateId;
    node_assert_1.default.ok(certId);
    // Download Certificate
    const certReq = new Request(`http://localhost/api/v1/signatures/certificate/${certId}`, {
        method: 'GET',
    });
    const certRes = await (0, route_js_9.GET)(certReq, { params: { id: certId } });
    node_assert_1.default.strictEqual(certRes.status, 200);
    // 8. Verify Billing & Quota Metrics
    const subReq = new Request('http://localhost/api/v1/billing/subscription', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawToken}` },
    });
    const subRes = await (0, route_js_10.GET)(subReq);
    node_assert_1.default.strictEqual(subRes.status, 200);
    const subBody = await subRes.json();
    node_assert_1.default.strictEqual(subBody.data.subscription.planTier, 'Free');
    node_assert_1.default.strictEqual(subBody.data.usage.documentCount, 1);
});
//# sourceMappingURL=release-candidate.test.js.map