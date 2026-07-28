"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const security_1 = require("@doctrack/security");
const route_js_1 = require("./upload/route.js");
const route_js_2 = require("./complete/route.js");
const route_js_3 = require("./route.js");
(0, node_test_1.default)('Core Document Engine: Upload -> Inspection -> Processing -> Status Ready', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearDocumentStoreForTesting)();
    (0, security_1.clearRateLimitStore)();
    // 1. Setup User & Session Token
    const { rawSessionToken } = (0, core_1.registerUserStore)('docuser@doctrack.com', 'SecurePass123!', 'Doc User');
    // 2. Initiate Upload
    const uploadReq = new Request('http://localhost/api/v1/documents/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: 'Q3 Pitch Deck',
            fileName: 'pitch_deck.pdf',
            fileSize: 1048576,
            mimeType: 'application/pdf',
        }),
    });
    const uploadRes = await (0, route_js_1.POST)(uploadReq);
    node_assert_1.default.strictEqual(uploadRes.status, 201);
    const uploadBody = await uploadRes.json();
    node_assert_1.default.strictEqual(uploadBody.success, true);
    const documentId = uploadBody.data.documentId;
    node_assert_1.default.ok(documentId);
    // 3. Complete Upload & Trigger Processing
    const completeReq = new Request('http://localhost/api/v1/documents/complete', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId,
        }),
    });
    const completeRes = await (0, route_js_2.POST)(completeReq);
    node_assert_1.default.strictEqual(completeRes.status, 200);
    const completeBody = await completeRes.json();
    node_assert_1.default.strictEqual(completeBody.data.document.status, 'Ready');
    node_assert_1.default.strictEqual(completeBody.data.document.pageCount, 1);
    // 4. List Documents
    const listReq = new Request('http://localhost/api/v1/documents', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawSessionToken}` },
    });
    const listRes = await (0, route_js_3.GET)(listReq);
    node_assert_1.default.strictEqual(listRes.status, 200);
    const listBody = await listRes.json();
    node_assert_1.default.strictEqual(listBody.data.documents.length, 1);
    node_assert_1.default.strictEqual(listBody.data.documents[0].title, 'Q3 Pitch Deck');
});
(0, node_test_1.default)('Sandboxed PDF Engine: Detection of Corrupted & Encrypted Files', () => {
    // Corrupted Buffer Test
    const invalidBuffer = Buffer.from('Not a PDF file');
    const invalidResult = (0, core_1.processPDFBuffer)(invalidBuffer);
    node_assert_1.default.strictEqual(invalidResult.isValid, false);
    node_assert_1.default.ok(invalidResult.error?.includes('Magic header'));
    // Encrypted PDF Buffer Test
    const encryptedBuffer = Buffer.from('%PDF-1.4\n1 0 obj << /Encrypt 2 0 R >> endobj');
    const encryptedResult = (0, core_1.processPDFBuffer)(encryptedBuffer);
    node_assert_1.default.strictEqual(encryptedResult.isValid, false);
    node_assert_1.default.strictEqual(encryptedResult.isEncrypted, true);
});
//# sourceMappingURL=documents.test.js.map