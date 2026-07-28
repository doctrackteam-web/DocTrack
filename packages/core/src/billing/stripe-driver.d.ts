import { PlanTier } from '../domain/billing.js';
export interface StripeCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}
export declare class StripeIntegrationDriver {
  private webhookSecret;
  constructor(webhookSecret?: string);
  createCheckoutSession(
    workspaceId: string,
    customerEmail: string,
    planTier: PlanTier,
    billingInterval?: 'monthly' | 'yearly',
  ): Promise<StripeCheckoutResult>;
  createBillingPortalSession(customerId: string): Promise<{
    portalUrl: string;
  }>;
  verifyWebhookSignature(payload: string, signatureHeader: string): boolean;
}
//# sourceMappingURL=stripe-driver.d.ts.map
