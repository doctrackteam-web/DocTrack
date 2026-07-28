import { generateSecureToken } from '@doctrack/security';
import {
  SubscriptionEntity,
  PlanTier,
  PLAN_LIMITS,
  UsageMetricsEntity,
} from '../domain/billing.js';

const subscriptionsMap = new Map<string, SubscriptionEntity>();

export function getSubscriptionForWorkspaceStore(
  workspaceId: string,
  ownerId: string,
): SubscriptionEntity {
  let sub = subscriptionsMap.get(workspaceId);
  if (!sub) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(now.getFullYear() + 10);

    sub = {
      id: `sub_${generateSecureToken(16)}`,
      workspaceId,
      ownerId,
      stripeCustomerId: `cus_${generateSecureToken(14)}`,
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

export function updateSubscriptionTierStore(
  workspaceId: string,
  planTier: PlanTier,
  stripeSubscriptionId?: string,
): SubscriptionEntity {
  const sub = subscriptionsMap.get(workspaceId);
  if (!sub) {
    throw new Error(`Subscription not found for workspace ${workspaceId}.`);
  }

  sub.planTier = planTier;
  if (stripeSubscriptionId) sub.stripeSubscriptionId = stripeSubscriptionId;
  sub.status = 'active';
  sub.updatedAt = new Date();
  return sub;
}

export function cancelSubscriptionStore(workspaceId: string): SubscriptionEntity {
  const sub = subscriptionsMap.get(workspaceId);
  if (!sub) {
    throw new Error(`Subscription not found for workspace ${workspaceId}.`);
  }

  sub.cancelAtPeriodEnd = true;
  sub.updatedAt = new Date();
  return sub;
}

export function reactivateSubscriptionStore(workspaceId: string): SubscriptionEntity {
  const sub = subscriptionsMap.get(workspaceId);
  if (!sub) {
    throw new Error(`Subscription not found for workspace ${workspaceId}.`);
  }

  sub.cancelAtPeriodEnd = false;
  sub.updatedAt = new Date();
  return sub;
}

export function checkQuotaEntitlementStore(
  workspaceId: string,
  ownerId: string,
  action: 'UPLOAD_DOCUMENT' | 'REQUEST_SIGNATURE',
  currentUsage: UsageMetricsEntity,
): { allowed: boolean; reason?: string; limits: (typeof PLAN_LIMITS)['Free'] } {
  const isBillingEnabled = process.env.BILLING_ENABLED === 'true';

  // Beta Mode: Bypass quota limits & grant Pro access
  if (!isBillingEnabled) {
    return { allowed: true, limits: PLAN_LIMITS.Pro };
  }

  const sub = getSubscriptionForWorkspaceStore(workspaceId, ownerId);
  const limits = PLAN_LIMITS[sub.planTier];

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

export function clearBillingStoreForTesting(): void {
  subscriptionsMap.clear();
}
