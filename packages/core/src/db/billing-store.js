"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionForWorkspaceStore = getSubscriptionForWorkspaceStore;
exports.updateSubscriptionTierStore = updateSubscriptionTierStore;
exports.cancelSubscriptionStore = cancelSubscriptionStore;
exports.reactivateSubscriptionStore = reactivateSubscriptionStore;
exports.checkQuotaEntitlementStore = checkQuotaEntitlementStore;
exports.clearBillingStoreForTesting = clearBillingStoreForTesting;
const security_1 = require("@doctrack/security");
const billing_js_1 = require("../domain/billing.js");
const subscriptionsMap = new Map();
function getSubscriptionForWorkspaceStore(workspaceId, ownerId) {
    let sub = subscriptionsMap.get(workspaceId);
    if (!sub) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setFullYear(now.getFullYear() + 10);
        sub = {
            id: `sub_${(0, security_1.generateSecureToken)(16)}`,
            workspaceId,
            ownerId,
            stripeCustomerId: `cus_${(0, security_1.generateSecureToken)(14)}`,
            planTier: 'Free',
            status: 'active',
            currentPeriodEnd: futureDate,
            cancelAtPeriodEnd: false,
            createdAt: now,
            updatedAt: now,
        };
        subscriptionsMap.set(workspaceId, sub);
    }
    return sub;
}
function updateSubscriptionTierStore(workspaceId, planTier, stripeSubscriptionId) {
    const sub = subscriptionsMap.get(workspaceId);
    if (!sub) {
        throw new Error(`Subscription not found for workspace ${workspaceId}.`);
    }
    sub.planTier = planTier;
    if (stripeSubscriptionId)
        sub.stripeSubscriptionId = stripeSubscriptionId;
    sub.status = 'active';
    sub.updatedAt = new Date();
    return sub;
}
function cancelSubscriptionStore(workspaceId) {
    const sub = subscriptionsMap.get(workspaceId);
    if (!sub) {
        throw new Error(`Subscription not found for workspace ${workspaceId}.`);
    }
    sub.cancelAtPeriodEnd = true;
    sub.updatedAt = new Date();
    return sub;
}
function reactivateSubscriptionStore(workspaceId) {
    const sub = subscriptionsMap.get(workspaceId);
    if (!sub) {
        throw new Error(`Subscription not found for workspace ${workspaceId}.`);
    }
    sub.cancelAtPeriodEnd = false;
    sub.updatedAt = new Date();
    return sub;
}
function checkQuotaEntitlementStore(workspaceId, ownerId, action, currentUsage) {
    const isBillingEnabled = process.env.BILLING_ENABLED === 'true';
    // Beta Mode: Bypass quota limits & grant Pro access
    if (!isBillingEnabled) {
        return { allowed: true, limits: billing_js_1.PLAN_LIMITS.Pro };
    }
    const sub = getSubscriptionForWorkspaceStore(workspaceId, ownerId);
    const limits = billing_js_1.PLAN_LIMITS[sub.planTier];
    if (action === 'UPLOAD_DOCUMENT') {
        if (currentUsage.documentCount >= limits.maxDocuments) {
            return {
                allowed: false,
                reason: `Plan document limit (${limits.maxDocuments}) reached. Please upgrade to Pro or Business.`,
                limits,
            };
        }
        if (currentUsage.storageUsedBytes >= limits.storageBytes) {
            return {
                allowed: false,
                reason: `Plan storage limit (${(limits.storageBytes / 1024 / 1024 / 1024).toFixed(0)} GB) reached. Please upgrade to Pro or Business.`,
                limits,
            };
        }
    }
    if (action === 'REQUEST_SIGNATURE') {
        if (currentUsage.signaturesUsedThisMonth >= limits.maxSignaturesPerMonth) {
            return {
                allowed: false,
                reason: `Monthly signature limit (${limits.maxSignaturesPerMonth}) reached. Please upgrade your plan.`,
                limits,
            };
        }
    }
    return { allowed: true, limits };
}
function clearBillingStoreForTesting() {
    subscriptionsMap.clear();
}
//# sourceMappingURL=billing-store.js.map