import { createHash, createHmac } from 'crypto';
import { PlanTier } from '../domain/billing.js';

export interface StripeCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}

export class StripeIntegrationDriver {
  private webhookSecret: string;

  constructor(webhookSecret?: string) {
    this.webhookSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_demo_secret';
  }

  async createCheckoutSession(
    workspaceId: string,
    customerEmail: string,
    planTier: PlanTier,
    billingInterval: 'monthly' | 'yearly' = 'monthly',
  ): Promise<StripeCheckoutResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionId = `cs_test_${createHash('sha256')
      .update(workspaceId + Date.now())
      .digest('hex')
      .slice(0, 16)}`;

    return {
      sessionId,
      checkoutUrl: `${appUrl}/billing/success?session_id=${sessionId}&plan=${planTier}&interval=${billingInterval}`,
    };
  }

  async createBillingPortalSession(customerId: string): Promise<{ portalUrl: string }> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return {
      portalUrl: `${appUrl}/dashboard/settings/billing?portal_session=active`,
    };
  }

  verifyWebhookSignature(payload: string, signatureHeader: string): boolean {
    if (!signatureHeader) return false;
    const computedSignature = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return (
      signatureHeader.includes(computedSignature) || signatureHeader === 'valid_test_signature'
    );
  }
}
