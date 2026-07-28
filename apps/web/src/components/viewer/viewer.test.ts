import test from 'node:test';
import assert from 'node:assert';
import { EdgeViewerController } from './EdgeDocumentViewer.js';
import { GET as streamHandler } from '../../app/api/v1/view/stream/[token]/route.js';
import { registerUserStore, clearStoreForTesting } from '@doctrack/core';

test('Edge Viewer Controller: Navigation, Zoom & Reading Analytics', () => {
  const viewer = new EdgeViewerController(10);
  let state = viewer.getState();

  assert.strictEqual(state.currentPage, 1);
  assert.strictEqual(state.totalPages, 10);
  assert.strictEqual(state.zoomLevel, 1.0);

  // Page Navigation
  viewer.nextPage();
  state = viewer.getState();
  assert.strictEqual(state.currentPage, 2);
  assert.strictEqual(state.scrollDepthPercent, 20);

  viewer.previousPage();
  state = viewer.getState();
  assert.strictEqual(state.currentPage, 1);

  // Zoom Controls
  viewer.setZoom(1.5);
  state = viewer.getState();
  assert.strictEqual(state.zoomLevel, 1.5);
  assert.strictEqual(state.fitMode, 'custom');

  // Idle Detection Test
  const futureTime = Date.now() + 15000; // 15 seconds later
  const isIdle = viewer.checkIdleState(futureTime);
  assert.strictEqual(isIdle, true);
});

test('Secure Streaming API: Headers & Anti-Hotlinking', async () => {
  clearStoreForTesting();
  const { rawSessionToken } = registerUserStore(
    'streamuser@doctrack.com',
    'Pass12345!',
    'Stream User',
  );

  const req = new Request(`http://localhost/api/v1/view/stream/${rawSessionToken}`, {
    method: 'GET',
  });

  const res = await streamHandler(req, { params: { token: rawSessionToken } });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('Content-Type'), 'application/pdf');
  assert.strictEqual(
    res.headers.get('Cache-Control'),
    'private, no-store, no-cache, must-revalidate',
  );
  assert.strictEqual(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
});
