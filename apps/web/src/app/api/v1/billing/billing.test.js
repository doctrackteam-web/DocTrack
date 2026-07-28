"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const route_js_1 = require("./plans/route.js");
const route_js_2 = require("./subscription/route.js");
const route_js_3 = require("./checkout/route.js");
const route_js_4 = require("./webhook/route.js");
(0, node_test_1.default)('Sprint 1D.0 Flow: Plans Listing -> Subscription Metrics -> Stripe Checkout & Webhook Processing', async () => {
    process.env.BILLING_ENABLED = 'true';
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearBillingStoreForTesting)();
    // 1. Setup User & Session
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('billinguser@doctrack.com', 'Pass12345!', 'Billing User');
    // 2. Fetch Plans List API
    const plansRes = await (0, route_js_1.GET)();
    node_assert_1.default.strictEqual(plansRes.status, 200);
    const plansBody = await plansRes.json();
    node_assert_1.default.strictEqual(plansBody.data.plans.length, 3);
    node_assert_1.default.strictEqual(plansBody.data.plans[0].tier, 'Free');
    // 3. Fetch Active Subscription API (Defaults to Free Plan)
    const subReq = new Request('http://localhost/api/v1/billing/subscription', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawSessionToken}` },
    });
    const subRes = await (0, route_js_2.GET)(subReq);
    node_assert_1.default.strictEqual(subRes.status, 200);
    const subBody = await subRes.json();
    node_assert_1.default.strictEqual(subBody.data.subscription.planTier, 'Free');
    node_assert_1.default.strictEqual(subBody.data.usage.documentCount, 0);
    // 4. Create Stripe Checkout Session
    const checkoutReq = new Request('http://localhost/api/v1/billing/checkout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planTier: 'Pro', interval: 'monthly' }),
    });
    const checkoutRes = await (0, route_js_3.POST)(checkoutReq);
    node_assert_1.default.strictEqual(checkoutRes.status, 200);
    const checkoutBody = await checkoutRes.json();
    node_assert_1.default.ok(checkoutBody.data.checkout.checkoutUrl.includes('billing/success'));
    // 5. Simulate Webhook Ingestion with Invalid Signature -> Expect 401
    const invalidWebhookReq = new Request('http://localhost/api/v1/billing/webhook', {
        method: 'POST',
        headers: { 'Stripe-Signature': 'invalid_signature' },
        body: JSON.stringify({ type: 'checkout.session.completed' }),
    });
    const invalidWebhookRes = await (0, route_js_4.POST)(invalidWebhookReq);
    node_assert_1.default.strictEqual(invalidWebhookRes.status, 401);
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
    const validWebhookRes = await (0, route_js_4.POST)(validWebhookReq);
    node_assert_1.default.strictEqual(validWebhookRes.status, 200);
    // 7. Verify Upgraded Subscription
    const upgradedSubRes = await (0, route_js_2.GET)(subReq);
    const upgradedSubBody = await upgradedSubRes.json();
    node_assert_1.default.strictEqual(upgradedSubBody.data.subscription.planTier, 'Pro');
});
(0, node_test_1.default)('Sprint 1D.0 Quota Enforcement: Exceeding Free Plan Limits', () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearBillingStoreForTesting)();
    const { user, workspace } = (0, core_1.registerUserStore)('quotauser@doctrack.com', 'Pass12345!', 'Quota User');
    // Test Free Plan Limit Reached (10 documents)
    const quotaCheck = (0, core_1.checkQuotaEntitlementStore)(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
        workspaceId: workspace.id,
        storageUsedBytes: 500000,
        documentCount: 10,
        signaturesUsedThisMonth: 0,
    });
    node_assert_1.default.strictEqual(quotaCheck.allowed, false);
    node_assert_1.default.ok(quotaCheck.reason?.includes('limit (10) reached'));
    // Upgrade Plan to Pro -> Verify Operation Allowed
    (0, core_1.updateSubscriptionTierStore)(workspace.id, 'Pro');
    const proQuotaCheck = (0, core_1.checkQuotaEntitlementStore)(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
        workspaceId: workspace.id,
        storageUsedBytes: 500000,
        documentCount: 10,
        signaturesUsedThisMonth: 0,
    });
    node_assert_1.default.strictEqual(proQuotaCheck.allowed, true);
});
//# sourceMappingURL=billing.test.js.map