"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
const stripe = new core_1.StripeIntegrationDriver();
async function POST(request) {
    const signature = request.headers.get('stripe-signature') || '';
    const payloadText = await request.text();
    if (!stripe.verifyWebhookSignature(payloadText, signature)) {
        return (0, api_response_js_1.createErrorResponse)('INVALID_WEBHOOK_SIGNATURE', 'Stripe webhook signature verification failed.', 401);
    }
    try {
        const event = JSON.parse(payloadText);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data?.object;
                const workspaceId = session?.client_reference_id || session?.metadata?.workspaceId;
                const planTier = session?.metadata?.planTier || 'Pro';
                if (workspaceId) {
                    (0, core_1.updateSubscriptionTierStore)(workspaceId, planTier, session.subscription);
                }
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data?.object;
                const workspaceId = subscription?.metadata?.workspaceId;
                const planTier = subscription?.metadata?.planTier;
                if (workspaceId && planTier) {
                    (0, core_1.updateSubscriptionTierStore)(workspaceId, planTier, subscription.id);
                }
                break;
            }
            default:
                break;
        }
        return (0, api_response_js_1.createSuccessResponse)({ received: true, eventType: event.type }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('WEBHOOK_PROCESSING_ERROR', error.message || 'Webhook processing failed.', 400);
    }
}
//# sourceMappingURL=route.js.map