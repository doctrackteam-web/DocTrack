import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearBillingStoreForTesting,
  registerUserStore,
  checkQuotaEntitlementStore,
} from '@doctrack/core';
import { GET as getSubHandler } from './subscription/route.js';
import { POST as checkoutHandler } from './checkout/route.js';

test('Sprint 1G.0 Beta Billing Mode (BILLING_ENABLED=false)', async () => {
  clearStoreForTesting();
  clearBillingStoreForTesting();
  process.env.BILLING_ENABLED = 'false';

  const { user, workspace, rawSessionToken } = registerUserStore(
    'beta@doctrack.com',
    'Pass12345!',
    'Beta User',
  );

  // 1. Check Subscription API in Beta Mode
  const subReq = new Request('http://localhost/api/v1/billing/subscription', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawSessionToken}` },
  });
  const subRes = await getSubHandler(subReq);
  assert.strictEqual(subRes.status, 200);
  const subBody = await subRes.json();
  assert.strictEqual(subBody.data.isBeta, true);
  assert.strictEqual(subBody.data.betaNotice, 'Beta – Payments Coming Soon');
  assert.strictEqual(subBody.data.subscription.planTier, 'Pro');

  // 2. Checkout API in Beta Mode -> Returns Beta Response instead of Stripe Session
  const checkoutReq = new Request('http://localhost/api/v1/billing/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rawSessionToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planTier: 'Pro' }),
  });
  const checkoutRes = await checkoutHandler(checkoutReq);
  assert.strictEqual(checkoutRes.status, 200);
  const checkoutBody = await checkoutRes.json();
  assert.strictEqual(checkoutBody.data.isBeta, true);
  assert.ok(checkoutBody.data.message.includes('Beta – Payments Coming Soon'));

  // 3. Quota Enforcement in Beta Mode -> Bypasses Free limits & allows 10+ documents
  const quotaCheck = checkQuotaEntitlementStore(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
    workspaceId: workspace.id,
    storageUsedBytes: 1000,
    documentCount: 15,
    signaturesUsedThisMonth: 0,
  });
  assert.strictEqual(quotaCheck.allowed, true);
});

test('Sprint 1G.0 Restoring Billing Flow (BILLING_ENABLED=true)', async () => {
  clearStoreForTesting();
  clearBillingStoreForTesting();
  process.env.BILLING_ENABLED = 'true';

  const { user, workspace, rawSessionToken } = registerUserStore(
    'pro@doctrack.com',
    'Pass12345!',
    'Pro User',
  );

  // Subscription API returns normal Free plan
  const subReq = new Request('http://localhost/api/v1/billing/subscription', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawSessionToken}` },
  });
  const subRes = await getSubHandler(subReq);
  const subBody = await subRes.json();
  assert.strictEqual(subBody.data.isBeta, false);
  assert.strictEqual(subBody.data.subscription.planTier, 'Free');

  // Quota enforcement enforced on Free limits (10 docs)
  const quotaCheck = checkQuotaEntitlementStore(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
    workspaceId: workspace.id,
    storageUsedBytes: 1000,
    documentCount: 10,
    signaturesUsedThisMonth: 0,
  });
  assert.strictEqual(quotaCheck.allowed, false);

  // Restore env flag
  process.env.BILLING_ENABLED = 'false';
});
