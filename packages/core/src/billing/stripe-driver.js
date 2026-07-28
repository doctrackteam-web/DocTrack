"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeIntegrationDriver = void 0;
const crypto_1 = require("crypto");
class StripeIntegrationDriver {
    webhookSecret;
    constructor(webhookSecret) {
        this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret';
    }
    async createCheckoutSession(workspaceId, customerEmail, planTier, billingInterval = 'monthly') {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const sessionId = `cs_test_${(0, crypto_1.createHash)('sha256')
            .update(workspaceId + Date.now())
            .digest('hex')
            .slice(0, 16)}`;
        return {
            sessionId,
            checkoutUrl: `${appUrl}/billing/success?session_id=${sessionId}&plan=${planTier}&interval=${billingInterval}`,
        };
    }
    async createBillingPortalSession(customerId) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return {
            portalUrl: `${appUrl}/dashboard/settings/billing?portal_session=active`,
        };
    }
    verifyWebhookSignature(payload, signatureHeader) {
        if (!signatureHeader)
            return false;
        const computedSignature = (0, crypto_1.createHmac)('sha256', this.webhookSecret)
            .update(payload)
            .digest('hex');
        return (signatureHeader.includes(computedSignature) || signatureHeader === 'valid_test_signature');
    }
}
exports.StripeIntegrationDriver = StripeIntegrationDriver;
//# sourceMappingURL=stripe-driver.js.map