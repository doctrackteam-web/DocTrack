import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearDocumentStoreForTesting,
  clearSignatureStoreForTesting,
  registerUserStore,
  createDocumentStore,
} from '@doctrack/core';
import { POST as createRequestHandler } from './request/route.js';
import { POST as signHandler } from './sign/route.js';
import { POST as declineHandler } from './decline/route.js';
import { GET as certHandler } from './certificate/[id]/route.js';

test('Sprint 1C.1 Flow: Create Signing Request -> Multi-Signer Signing -> Audit Trail Certificate Generation', async () => {
  clearStoreForTesting();
  clearDocumentStoreForTesting();
  clearSignatureStoreForTesting();

  // 1. Setup User & Document
  const { user, workspace, rawSessionToken } = registerUserStore(
    'owner@doctrack.com',
    'Pass12345!',
    'Owner User',
  );
  const doc = createDocumentStore(
    workspace.id,
    user.id,
    'Consulting Agreement 2026',
    'workspaces/ws1/agreement.pdf',
    2048576,
  );

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

  const reqRes = await createRequestHandler(reqPayload);
  assert.strictEqual(reqRes.status, 201);
  const reqBody = await reqRes.json();
  assert.strictEqual(reqBody.data.signerLinks.length, 2);

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
  const signRes1 = await signHandler(signReq1);
  assert.strictEqual(signRes1.status, 200);
  const signBody1 = await signRes1.json();
  assert.strictEqual(signBody1.data.isCompleted, false);

  // 4. Signer 2 Signs Document -> Triggers Completion & Certificate Generation
  const signReq2 = new Request('http://localhost/api/v1/signatures/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: token2,
      fieldValues: [{ fieldId: 'fld_2', value: 'data:image/png;base64,bob_signature' }],
    }),
  });
  const signRes2 = await signHandler(signReq2);
  assert.strictEqual(signRes2.status, 200);
  const signBody2 = await signRes2.json();
  assert.strictEqual(signBody2.data.isCompleted, true);
  const certificateId = signBody2.data.certificateId;
  assert.ok(certificateId);

  // 5. Fetch Completion Certificate & Verify SHA-256 Audit Trail Hash Chain
  const certReq = new Request(`http://localhost/api/v1/signatures/certificate/${certificateId}`, {
    method: 'GET',
  });
  const certRes = await certHandler(certReq, { params: { id: certificateId } });
  assert.strictEqual(certRes.status, 200);
  const certBody = await certRes.json();
  assert.strictEqual(certBody.data.certificate.id, certificateId);
  assert.strictEqual(certBody.data.certificate.participants.length, 2);
  assert.ok(certBody.data.certificate.auditTrail.length >= 3);
});

test('Sprint 1C.1 Flow: Signer Declines Request', async () => {
  clearStoreForTesting();
  clearDocumentStoreForTesting();
  clearSignatureStoreForTesting();

  const { user, workspace, rawSessionToken } = registerUserStore(
    'owner2@doctrack.com',
    'Pass12345!',
    'Owner 2',
  );
  const doc = createDocumentStore(
    workspace.id,
    user.id,
    'Vendor Contract',
    'workspaces/ws1/contract.pdf',
    1048576,
  );

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

  const reqRes = await createRequestHandler(reqPayload);
  const reqBody = await reqRes.json();
  const token = reqBody.data.signerLinks[0].url.split('/sign/')[1];

  const declineReq = new Request('http://localhost/api/v1/signatures/decline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const declineRes = await declineHandler(declineReq);
  assert.strictEqual(declineRes.status, 200);
  const declineBody = await declineRes.json();
  assert.strictEqual(declineBody.data.status, 'Declined');
});
