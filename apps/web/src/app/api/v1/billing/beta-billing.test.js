"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const core_1 = require("@doctrack/core");
const route_js_1 = require("./subscription/route.js");
const route_js_2 = require("./checkout/route.js");
(0, node_test_1.default)('Sprint 1G.0 Beta Billing Mode (BILLING_ENABLED=false)', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearBillingStoreForTesting)();
    process.env.BILLING_ENABLED = 'false';
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('beta@doctrack.com', 'Pass12345!', 'Beta User');
    // 1. Check Subscription API in Beta Mode
    const subReq = new Request('http://localhost/api/v1/billing/subscription', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawSessionToken}` },
    });
    const subRes = await (0, route_js_1.GET)(subReq);
    node_assert_1.default.strictEqual(subRes.status, 200);
    const subBody = await subRes.json();
    node_assert_1.default.strictEqual(subBody.data.isBeta, true);
    node_assert_1.default.strictEqual(subBody.data.betaNotice, 'Beta – Payments Coming Soon');
    node_assert_1.default.strictEqual(subBody.data.subscription.planTier, 'Pro');
    // 2. Checkout API in Beta Mode -> Returns Beta Response instead of Stripe Session
    const checkoutReq = new Request('http://localhost/api/v1/billing/checkout', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${rawSessionToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planTier: 'Pro' }),
    });
    const checkoutRes = await (0, route_js_2.POST)(checkoutReq);
    node_assert_1.default.strictEqual(checkoutRes.status, 200);
    const checkoutBody = await checkoutRes.json();
    node_assert_1.default.strictEqual(checkoutBody.data.isBeta, true);
    node_assert_1.default.ok(checkoutBody.data.message.includes('Beta – Payments Coming Soon'));
    // 3. Quota Enforcement in Beta Mode -> Bypasses Free limits & allows 10+ documents
    const quotaCheck = (0, core_1.checkQuotaEntitlementStore)(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
        workspaceId: workspace.id,
        storageUsedBytes: 1000,
        documentCount: 15,
        signaturesUsedThisMonth: 0,
    });
    node_assert_1.default.strictEqual(quotaCheck.allowed, true);
});
(0, node_test_1.default)('Sprint 1G.0 Restoring Billing Flow (BILLING_ENABLED=true)', async () => {
    (0, core_1.clearStoreForTesting)();
    (0, core_1.clearBillingStoreForTesting)();
    process.env.BILLING_ENABLED = 'true';
    const { user, workspace, rawSessionToken } = (0, core_1.registerUserStore)('pro@doctrack.com', 'Pass12345!', 'Pro User');
    // Subscription API returns normal Free plan
    const subReq = new Request('http://localhost/api/v1/billing/subscription', {
        method: 'GET',
        headers: { Authorization: `Bearer ${rawSessionToken}` },
    });
    const subRes = await (0, route_js_1.GET)(subReq);
    const subBody = await subRes.json();
    node_assert_1.default.strictEqual(subBody.data.isBeta, false);
    node_assert_1.default.strictEqual(subBody.data.subscription.planTier, 'Free');
    // Quota enforcement enforced on Free limits (10 docs)
    const quotaCheck = (0, core_1.checkQuotaEntitlementStore)(workspace.id, user.id, 'UPLOAD_DOCUMENT', {
        workspaceId: workspace.id,
        storageUsedBytes: 1000,
        documentCount: 10,
        signaturesUsedThisMonth: 0,
    });
    node_assert_1.default.strictEqual(quotaCheck.allowed, false);
    // Restore env flag
    process.env.BILLING_ENABLED = 'false';
});
//# sourceMappingURL=beta-billing.test.js.map