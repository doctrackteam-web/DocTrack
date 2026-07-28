import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearDocumentStoreForTesting,
  registerUserStore,
  processPDFBuffer,
} from '@doctrack/core';
import { clearRateLimitStore } from '@doctrack/security';
import { POST as uploadHandler } from './upload/route.js';
import { POST as completeHandler } from './complete/route.js';
import { GET as listHandler } from './route.js';

test('Core Document Engine: Upload -> Inspection -> Processing -> Status Ready', async () => {
  clearStoreForTesting();
  clearDocumentStoreForTesting();
  clearRateLimitStore();

  // 1. Setup User & Session Token
  const { rawSessionToken } = registerUserStore(
    'docuser@doctrack.com',
    'SecurePass123!',
    'Doc User',
  );

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

  const uploadRes = await uploadHandler(uploadReq);
  assert.strictEqual(uploadRes.status, 201);
  const uploadBody = await uploadRes.json();
  assert.strictEqual(uploadBody.success, true);
  const documentId = uploadBody.data.documentId;
  assert.ok(documentId);

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

  const completeRes = await completeHandler(completeReq);
  assert.strictEqual(completeRes.status, 200);
  const completeBody = await completeRes.json();
  assert.strictEqual(completeBody.data.document.status, 'Ready');
  assert.strictEqual(completeBody.data.document.pageCount, 1);

  // 4. List Documents
  const listReq = new Request('http://localhost/api/v1/documents', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawSessionToken}` },
  });

  const listRes = await listHandler(listReq);
  assert.strictEqual(listRes.status, 200);
  const listBody = await listRes.json();
  assert.strictEqual(listBody.data.documents.length, 1);
  assert.strictEqual(listBody.data.documents[0].title, 'Q3 Pitch Deck');
});

test('Sandboxed PDF Engine: Detection of Corrupted & Encrypted Files', () => {
  // Corrupted Buffer Test
  const invalidBuffer = Buffer.from('Not a PDF file');
  const invalidResult = processPDFBuffer(invalidBuffer);
  assert.strictEqual(invalidResult.isValid, false);
  assert.ok(invalidResult.error?.includes('Magic header'));

  // Encrypted PDF Buffer Test
  const encryptedBuffer = Buffer.from('%PDF-1.4\n1 0 obj << /Encrypt 2 0 R >> endobj');
  const encryptedResult = processPDFBuffer(encryptedBuffer);
  assert.strictEqual(encryptedResult.isValid, false);
  assert.strictEqual(encryptedResult.isEncrypted, true);
});
