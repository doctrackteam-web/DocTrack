export type PlanTier = 'Free' | 'Pro' | 'Business';
export interface PlanLimits {
  storageBytes: number;
  maxDocuments: number;
  maxSignaturesPerMonth: number;
  maxTeamSeats: number;
  analyticsRetentionDays: number;
}
export declare const PLAN_LIMITS: Record<PlanTier, PlanLimits>;
export interface SubscriptionEntity {
  id: string;
  workspaceId: string;
  ownerId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  planTier: PlanTier;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface UsageMetricsEntity {
  workspaceId: string;
  storageUsedBytes: number;
  documentCount: number;
  signaturesUsedThisMonth: number;
}
//# sourceMappingURL=billing.d.ts.map
