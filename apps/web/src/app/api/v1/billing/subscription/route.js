"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function GET(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
    if (!workspace) {
        return (0, api_response_js_1.createErrorResponse)('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
    }
    const subscription = (0, core_1.getSubscriptionForWorkspaceStore)(workspace.id, sessionData.user.id);
    const docs = (0, core_1.listDocumentsForWorkspaceStore)(workspace.id);
    const storageUsedBytes = docs.reduce((acc, d) => acc + d.fileSize, 0);
    const limits = core_1.PLAN_LIMITS[subscription.planTier];
    const isBillingEnabled = process.env.BILLING_ENABLED === 'true';
    return (0, api_response_js_1.createSuccessResponse)({
        isBillingEnabled,
        isBeta: !isBillingEnabled,
        betaNotice: !isBillingEnabled ? 'Beta – Payments Coming Soon' : null,
        subscription: {
            id: subscription.id,
            planTier: isBillingEnabled ? subscription.planTier : 'Pro',
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        },
        usage: {
            documentCount: docs.length,
            maxDocuments: isBillingEnabled ? limits.maxDocuments : core_1.PLAN_LIMITS.Pro.maxDocuments,
            storageUsedBytes,
            maxStorageBytes: isBillingEnabled ? limits.storageBytes : core_1.PLAN_LIMITS.Pro.storageBytes,
            storageUsedMb: (storageUsedBytes / 1024 / 1024).toFixed(2),
            maxStorageGb: Math.round((isBillingEnabled ? limits.storageBytes : core_1.PLAN_LIMITS.Pro.storageBytes) /
                1024 /
                1024 /
                1024),
        },
    }, 200);
}
//# sourceMappingURL=route.js.map