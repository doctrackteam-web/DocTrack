"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
const stripe = new core_1.StripeIntegrationDriver();
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    try {
        const isBillingEnabled = process.env.BILLING_ENABLED === 'true';
        if (!isBillingEnabled) {
            return (0, api_response_js_1.createSuccessResponse)({
                isBeta: true,
                message: 'Beta – Payments Coming Soon. All Pro features are currently free during public beta.',
            }, 200);
        }
        const { planTier, interval } = await request.json();
        if (!planTier || (planTier !== 'Pro' && planTier !== 'Business')) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Valid target planTier (Pro or Business) is required.', 400);
        }
        const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
        if (!workspace) {
            return (0, api_response_js_1.createErrorResponse)('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
        }
        const checkout = await stripe.createCheckoutSession(workspace.id, sessionData.user.email, planTier, interval);
        return (0, api_response_js_1.createSuccessResponse)({ checkout }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('CHECKOUT_FAILED', error.message || 'Checkout session failed.', 400);
    }
}
//# sourceMappingURL=route.js.map