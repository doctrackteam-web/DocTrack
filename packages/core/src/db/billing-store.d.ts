import {
  SubscriptionEntity,
  PlanTier,
  PLAN_LIMITS,
  UsageMetricsEntity,
} from '../domain/billing.js';
export declare function getSubscriptionForWorkspaceStore(
  workspaceId: string,
  ownerId: string,
): SubscriptionEntity;
export declare function updateSubscriptionTierStore(
  workspaceId: string,
  planTier: PlanTier,
  stripeSubscriptionId?: string,
): SubscriptionEntity;
export declare function cancelSubscriptionStore(workspaceId: string): SubscriptionEntity;
export declare function reactivateSubscriptionStore(workspaceId: string): SubscriptionEntity;
export declare function checkQuotaEntitlementStore(
  workspaceId: string,
  ownerId: string,
  action: 'UPLOAD_DOCUMENT' | 'REQUEST_SIGNATURE',
  currentUsage: UsageMetricsEntity,
): {
  allowed: boolean;
  reason?: string;
  limits: (typeof PLAN_LIMITS)['Free'];
};
export declare function clearBillingStoreForTesting(): void;
//# sourceMappingURL=billing-store.d.ts.map
