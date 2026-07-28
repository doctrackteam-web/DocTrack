import test from 'node:test';
import assert from 'node:assert';
import {
  clearStoreForTesting,
  clearBillingStoreForTesting,
  registerUserStore,
  checkQuotaEntitlementStore,
  updateSubscriptionTierStore,
} from '@doctrack/core';
import { GET as getPlansHandler } from './plans/route.js';
import { GET as getSubHandler } from './subscription/route.js';
import { POST as checkoutHandler } from './checkout/route.js';
import { POST as webhookHandler } from './webhook/route.js';

test('Sprint 1D.0 Flow: Plans Listing -> Subscription Metrics -> Stripe Checkout & Webhook Processing', async () => {
  process.env.BILLING_ENABLED = 'true';
  clearStoreForTesting();
  clearBillingStoreForTesting();

  // 1. Setup User & Session
  const { user, workspace, rawSessionToken } = registerUserStore(
    'billinguser@doctrack.com',
    'Pass12345!',
    'Billing User',
  );

  // 2. Fetch Plans List API
  const plansRes = await getPlansHandler();
  assert.strictEqual(plansRes.status, 200);
  const plansBody = await plansRes.json();
  assert.strictEqual(plansBody.data.plans.length, 3);
  assert.strictEqual(plansBody.data.plans[0].tier, 'Free');

  // 3. Fetch Active Subscription API (Defaults to Free Plan)
  const subReq = new Request('http://localhost/api/v1/billing/subscription', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rawSessionToken}` },
  });
  const subRes = await getSubHandler(subReq);
  assert.strictEqual(subRes.status, 200);
  const subBody = await subRes.json();
  assert.strictEqual(subBody.data.subscription.planTier, 'Free');
  assert.strictEqual(subBody.data.usage.documentCount, 0);

  // 4. Create Stripe Checkout Session
  const checkoutReq = new Request('http://localhost/api/v1/billing/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${rawSessionToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planTier: 'Pro', interval: 'monthly' }),
  });
  const checkoutRes = await checkoutHandler(checkoutReq);
  assert.strictEqual(checkoutRes.status, 200);
  const checkoutBody = await checkoutRes.json();
  assert.ok(checkoutBody.data.checkout.checkoutUrl.includes('billing/success'));

  // 5. Simulate Webhook Ingestion with Invalid Signature -> Expect 401
  const invalidWebhookReq = new Request('http://localhost/api/v1/billing/webhook', {
    method: 'POST',
    headers: { 'Stripe-Signature': 'invalid_signature' },
    body: JSON.stringify({ type: 'checkout.session.completed' }),
  });
  const invalidWebhookRes = await webhookHandler(invalidWebhookReq);
  assert.strictEqual(invalidWebhookRes.status, 401);

  // 6. Simulate Webhook Ingestion with Valid Signature -> Upgrade Plan to Pro
  const validWebhookReq = new Request('http://localhost/api/v1/billing/webhook', {
    method: 'POST',
    headers: { 'Stripe-Signature': 'valid_test_signature' },
    body: JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: workspace.id,
          subscription: 'sub_stripe_123',
          metadata: { planTier: 'Pro' },
        },
      },
    }),
  });
  const validWebhookRes = await webhookHandler(validWebhookReq);
  assert.strictEqual(validWebhookRes.status, 200);

  // 7. Verify Upgraded Subscription
  const upgradedSubRes = await getSubHandler(subReq);
  const upgradedSubBody = await upgradedSubRes.json();
  assert.strictEqual(upgradedSubBody.data.subscription.planTier, 'Pro');
});

test('Sprint 1D.0 Quota Enforcement: Exceeding Free Plan Limits', () => {
  clearStoreForTesting();
  clearBillingStoreForTesting();

  const { user, workspace } = registerUserStore(
    'quotauser@doctrack.com',
    'Pass12345!',
    'Quota User',
  );

  // Test Free Plan Limit Reached (10 documents)
  const quotaCheck = checkQuotaEntitlementStore(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
    workspaceId: workspace.id,
    storageUsedBytes: 500000,
    documentCount: 10,
    signaturesUsedThisMonth: 0,
  });

  assert.strictEqual(quotaCheck.allowed, false);
  assert.ok(quotaCheck.reason?.includes('limit (10) reached'));

  // Upgrade Plan to Pro -> Verify Operation Allowed
  updateSubscriptionTierStore(workspace.id, 'Pro');
  const proQuotaCheck = checkQuotaEntitlementStore(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
    workspaceId: workspace.id,
    storageUsedBytes: 500000,
    documentCount: 10,
    signaturesUsedThisMonth: 0,
  });

  assert.strictEqual(proQuotaCheck.allowed, true);
});
