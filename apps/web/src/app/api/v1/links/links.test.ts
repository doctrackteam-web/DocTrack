import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearDocumentStoreForTesting,
  clearLinkStoreForTesting,
  clearAnalyticsStoreForTesting,
  registerUserStore,
  createDocumentStore,
} from '@doctrack/core';
import { clearRateLimitStore } from '@doctrack/security';
import { POST as createLinkHandler, GET as listLinksHandler } from './route.js';
import { POST as accessViewerHandler } from '../view/access/route.js';
import { POST as eventAnalyticsHandler } from '../analytics/event/route.js';

test('Sprint 1B.1 Core Flow: Generate Password Link -> Viewer Access -> Analytics Ingestion', async () => {
  clearStoreForTesting();
  clearDocumentStoreForTesting();
  clearLinkStoreForTesting();
  clearAnalyticsStoreForTesting();
  clearRateLimitStore();

  // 1. Setup User & Document
  const { user, workspace, rawSessionToken } = registerUserStore(
    'share@doctrack.com',
    'Pass12345!',
    'Share User',
  );
  const doc = createDocumentStore(
    workspace.id,
    user.id,
    'Series A Pitch Deck',
    'key_deck.pdf',
    2048576,
  );

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

  const linkRes = await createLinkHandler(linkReq);
  assert.strictEqual(linkRes.status, 201);
  const linkBody = await linkRes.json();
  assert.strictEqual(linkBody.data.link.slug, 'series-a-deck');
  assert.strictEqual(linkBody.data.link.isPasswordProtected, true);

  // 3. Attempt Access Without Password -> Expect 401 PASSWORD_REQUIRED
  const noPassReq = new Request('http://localhost/api/v1/view/access', {
    method: 'POST',
    body: JSON.stringify({ slug: 'series-a-deck' }),
  });
  const noPassRes = await accessViewerHandler(noPassReq);
  assert.strictEqual(noPassRes.status, 401);

  // 4. Access With Correct Password -> Expect 200 & Session ID
  const validAccessReq = new Request('http://localhost/api/v1/view/access', {
    method: 'POST',
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    body: JSON.stringify({ slug: 'series-a-deck', password: 'InvestorPassword123!' }),
  });
  const validAccessRes = await accessViewerHandler(validAccessReq);
  assert.strictEqual(validAccessRes.status, 200);
  const accessBody = await validAccessRes.json();
  const sessionId = accessBody.data.sessionId;
  assert.ok(sessionId);

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

  const eventRes = await eventAnalyticsHandler(eventReq);
  assert.strictEqual(eventRes.status, 201);
});
