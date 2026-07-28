import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearDocumentStoreForTesting,
  clearFolderStoreForTesting,
  registerUserStore,
  createDocumentStore,
} from '@doctrack/core';
import { POST as createFolderHandler, GET as listFoldersHandler } from './folders/route.js';
import { GET as searchHandler } from './search/route.js';
import { GET as metricsHandler } from './dashboard/metrics/route.js';

test('Sprint 1B.3 Flow: Folders, Global Search & Dashboard Metrics', async () => {
  clearStoreForTesting();
  clearDocumentStoreForTesting();
  clearFolderStoreForTesting();

  // 1. Setup User & Session
  const { user, workspace, rawSessionToken } = registerUserStore(
    'orguser@doctrack.com',
    'SecurePass123!',
    'Org User',
  );

  // 2. Create Folder
  const folderReq = new Request('http://localhost/api/v1/folders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rawSessionToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: 'Financial Reports 2026' }),
  });
  const folderRes = await createFolderHandler(folderReq);
  assert.strictEqual(folderRes.status, 201);
  const folderBody = await folderRes.json();
  assert.strictEqual(folderBody.data.folder.name, 'Financial Reports 2026');

  // 3. Create Document
  createDocumentStore(
    workspace.id,
    user.id,
    'Q3 Income Statement',
    'workspaces/ws1/q3.pdf',
    1048576,
  );

  // 4. Test Global Search API
  const searchReq = new Request('http://localhost/api/v1/search?q=Financial', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawSessionToken}` },
  });
  const searchRes = await searchHandler(searchReq);
  assert.strictEqual(searchRes.status, 200);
  const searchBody = await searchRes.json();
  assert.strictEqual(searchBody.data.results.length, 1);
  assert.strictEqual(searchBody.data.results[0].title, 'Financial Reports 2026');

  // 5. Test Owner Dashboard Metrics API
  const metricsReq = new Request('http://localhost/api/v1/dashboard/metrics', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawSessionToken}` },
  });
  const metricsRes = await metricsHandler(metricsReq);
  assert.strictEqual(metricsRes.status, 200);
  const metricsBody = await metricsRes.json();
  assert.strictEqual(metricsBody.data.metrics.totalDocuments, 1);
  assert.strictEqual(metricsBody.data.metrics.totalFolders, 1);
  assert.strictEqual(metricsBody.data.metrics.storageUsedMb, '1.00');
});
