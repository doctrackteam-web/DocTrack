export type PlanTier = 'Free' | 'Pro' | 'Business';

export interface PlanLimits {
  storageBytes: number; // e.g. 1GB / 50GB / 500GB
  maxDocuments: number;
  maxSignaturesPerMonth: number;
  maxTeamSeats: number;
  analyticsRetentionDays: number;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  Free: {
    storageBytes: 1 * 1024 * 1024 * 1024, // 1 GB
    maxDocuments: 10,
    maxSignaturesPerMonth: 3,
    maxTeamSeats: 1,
    analyticsRetentionDays: 30,
  },
  Pro: {
    storageBytes: 50 * 1024 * 1024 * 1024, // 50 GB
    maxDocuments: 500,
    maxSignaturesPerMonth: 100,
    maxTeamSeats: 5,
    analyticsRetentionDays: 365,
  },
  Business: {
    storageBytes: 500 * 1024 * 1024 * 1024, // 500 GB
    maxDocuments: 10000,
    maxSignaturesPerMonth: 1000,
    maxTeamSeats: 25,
    analyticsRetentionDays: 1095,
  },
};

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
