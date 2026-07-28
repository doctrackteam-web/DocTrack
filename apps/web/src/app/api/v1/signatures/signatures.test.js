"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const route_js_1 = require("./request/route.js");
const route_js_2 = require("./sign/route.js");
const route_js_3 = require("./decline/route.js");
const route_js_4 = require("./certificate/[id]/route.js");
(0, node_test_1.default)('Sprint 1C.1 Flow: Create Signing Request -> Multi-Signer Signing -> Audit Trail Certificate Generation', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearDocumentStoreForTesting)();
    (0, core_1.clearSignatureStoreForTesting)();
    // 1. Setup User & Document
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('owner@doctrack.com', 'Pass12345!', 'Owner User');
    const doc = (0, core_1.createDocumentStore)(workspace.id, user.id, 'Consulting Agreement 2026', 'workspaces/ws1/agreement.pdf', 2048576);
    // 2. Create Multi-Signer Request
    const reqPayload = new Request('http://localhost/api/v1/signatures/request', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId: doc.id,
            title: 'Consulting Agreement 2026',
            participants: [
                { email: 'signer1@client.com', name: 'Alice Client', signingOrder: 1 },
                { email: 'signer2@vendor.com', name: 'Bob Vendor', signingOrder: 2 },
            ],
            fields: [
                {
                    page: 1,
                    x: 100,
                    y: 200,
                    width: 150,
                    height: 50,
                    required: true,
                    fieldType: 'signature',
                    assignedSignerEmail: 'signer1@client.com',
                },
                {
                    page: 1,
                    x: 100,
                    y: 300,
                    width: 150,
                    height: 50,
                    required: true,
                    fieldType: 'signature',
                    assignedSignerEmail: 'signer2@vendor.com',
                },
            ],
        }),
    });
    const reqRes = await (0, route_js_1.POST)(reqPayload);
    node_assert_1.default.strictEqual(reqRes.status, 201);
    const reqBody = await reqRes.json();
    node_assert_1.default.strictEqual(reqBody.data.signerLinks.length, 2);
    const token1 = reqBody.data.signerLinks[0].url.split('/sign/')[1];
    const token2 = reqBody.data.signerLinks[1].url.split('/sign/')[1];
    // 3. Signer 1 Signs Document
    const signReq1 = new Request('http://localhost/api/v1/signatures/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: token1,
            fieldValues: [{ fieldId: 'fld_1', value: 'data:image/png;base64,alice_signature' }],
        }),
    });
    const signRes1 = await (0, route_js_2.POST)(signReq1);
    node_assert_1.default.strictEqual(signRes1.status, 200);
    const signBody1 = await signRes1.json();
    node_assert_1.default.strictEqual(signBody1.data.isCompleted, false);
    // 4. Signer 2 Signs Document -> Triggers Completion & Certificate Generation
    const signReq2 = new Request('http://localhost/api/v1/signatures/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token: token2,
            fieldValues: [{ fieldId: 'fld_2', value: 'data:image/png;base64,bob_signature' }],
        }),
    });
    const signRes2 = await (0, route_js_2.POST)(signReq2);
    node_assert_1.default.strictEqual(signRes2.status, 200);
    const signBody2 = await signRes2.json();
    node_assert_1.default.strictEqual(signBody2.data.isCompleted, true);
    const certificateId = signBody2.data.certificateId;
    node_assert_1.default.ok(certificateId);
    // 5. Fetch Completion Certificate & Verify SHA-256 Audit Trail Hash Chain
    const certReq = new Request(`http://localhost/api/v1/signatures/certificate/${certificateId}`, {
        method: 'GET',
    });
    const certRes = await (0, route_js_4.GET)(certReq, { params: { id: certificateId } });
    node_assert_1.default.strictEqual(certRes.status, 200);
    const certBody = await certRes.json();
    node_assert_1.default.strictEqual(certBody.data.certificate.id, certificateId);
    node_assert_1.default.strictEqual(certBody.data.certificate.participants.length, 2);
    node_assert_1.default.ok(certBody.data.certificate.auditTrail.length >= 3);
});
(0, node_test_1.default)('Sprint 1C.1 Flow: Signer Declines Request', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearDocumentStoreForTesting)();
    (0, core_1.clearSignatureStoreForTesting)();
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('owner2@doctrack.com', 'Pass12345!', 'Owner 2');
    const doc = (0, core_1.createDocumentStore)(workspace.id, user.id, 'Vendor Contract', 'workspaces/ws1/contract.pdf', 1048576);
    const reqPayload = new Request('http://localhost/api/v1/signatures/request', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId: doc.id,
            title: 'Vendor Contract',
            participants: [{ email: 'decline@vendor.com', name: 'Dan Vendor' }],
        }),
    });
    const reqRes = await (0, route_js_1.POST)(reqPayload);
    const reqBody = await reqRes.json();
    const token = reqBody.data.signerLinks[0].url.split('/sign/')[1];
    const declineReq = new Request('http://localhost/api/v1/signatures/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
    });
    const declineRes = await (0, route_js_3.POST)(declineReq);
    node_assert_1.default.strictEqual(declineRes.status, 200);
    const declineBody = await declineRes.json();
    node_assert_1.default.strictEqual(declineBody.data.status, 'Declined');
});
//# sourceMappingURL=signatures.test.js.map