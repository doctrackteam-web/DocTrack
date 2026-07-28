import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearDocumentStoreForTesting,
  clearLinkStoreForTesting,
  clearAnalyticsStoreForTesting,
  clearSignatureStoreForTesting,
  clearBillingStoreForTesting,
  registerUserStore,
} from '@doctrack/core';
import { clearRateLimitStore } from '@doctrack/security';

// Route Handlers
import { POST as registerHandler } from './auth/register/route.js';
import { POST as loginHandler } from './auth/login/route.js';
import { POST as uploadHandler } from './documents/upload/route.js';
import { POST as completeDocHandler } from './documents/complete/route.js';
import { POST as createLinkHandler } from './links/route.js';
import { POST as accessViewerHandler } from './view/access/route.js';
import { POST as eventAnalyticsHandler } from './analytics/event/route.js';
import { POST as sigRequestHandler } from './signatures/request/route.js';
import { POST as signHandler } from './signatures/sign/route.js';
import { GET as certHandler } from './signatures/certificate/[id]/route.js';
import { GET as subHandler } from './billing/subscription/route.js';

test('Release Candidate (RC-1) E2E User Journey Verification', async () => {
  process.env.BILLING_ENABLED = 'true';
  clearStoreForTesting();
  clearDocumentStoreForTesting();
  clearLinkStoreForTesting();
  clearAnalyticsStoreForTesting();
  clearSignatureStoreForTesting();
  clearBillingStoreForTesting();
  clearRateLimitStore();

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
  const regRes = await registerHandler(regReq);
  assert.strictEqual(regRes.status, 201);
  const regBody = await regRes.json();
  const rawToken = regBody.data.sessionToken;
  assert.ok(rawToken);

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
  const uploadRes = await uploadHandler(uploadReq);
  assert.strictEqual(uploadRes.status, 201);
  const uploadBody = await uploadRes.json();
  const documentId = uploadBody.data.documentId;
  assert.ok(documentId);

  // 3. Complete PDF Upload & Trigger Sandboxed Inspection
  const completeReq = new Request('http://localhost/api/v1/documents/complete', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rawToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ documentId }),
  });
  const completeRes = await completeDocHandler(completeReq);
  assert.strictEqual(completeRes.status, 200);

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
  const linkRes = await createLinkHandler(linkReq);
  assert.strictEqual(linkRes.status, 201);
  const linkBody = await linkRes.json();
  assert.strictEqual(linkBody.data.link.slug, 'msa-2026-link');

  // 5. Open Edge Viewer & Initialize Session
  const accessReq = new Request('http://localhost/api/v1/view/access', {
    method: 'POST',
    body: JSON.stringify({ slug: 'msa-2026-link', password: 'ClientAccessPass123!' }),
  });
  const accessRes = await accessViewerHandler(accessReq);
  assert.strictEqual(accessRes.status, 200);
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
  const eventRes = await eventAnalyticsHandler(eventReq);
  assert.strictEqual(eventRes.status, 201);

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
  const sigReqRes = await sigRequestHandler(sigReqPayload);
  assert.strictEqual(sigReqRes.status, 201);
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
  const signRes = await signHandler(signReq);
  assert.strictEqual(signRes.status, 200);
  const signBody = await signRes.json();
  const certId = signBody.data.certificateId;
  assert.ok(certId);

  // Download Certificate
  const certReq = new Request(`http://localhost/api/v1/signatures/certificate/${certId}`, {
    method: 'GET',
  });
  const certRes = await certHandler(certReq, { params: { id: certId } });
  assert.strictEqual(certRes.status, 200);

  // 8. Verify Billing & Quota Metrics
  const subReq = new Request('http://localhost/api/v1/billing/subscription', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawToken}` },
  });
  const subRes = await subHandler(subReq);
  assert.strictEqual(subRes.status, 200);
  const subBody = await subRes.json();
  assert.strictEqual(subBody.data.subscription.planTier, 'Free');
  assert.strictEqual(subBody.data.usage.documentCount, 1);
});
