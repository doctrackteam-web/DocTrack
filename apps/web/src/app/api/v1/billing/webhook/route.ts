import { StripeIntegrationDriver, updateSubscriptionTierStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

const stripe = new StripeIntegrationDriver();

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') || '';
  const payloadText = await request.text();

  if (!stripe.verifyWebhookSignature(payloadText, signature)) {
    return createErrorResponse(
      'INVALID_WEBHOOK_SIGNATURE',
      'Stripe webhook signature verification failed.',
      401,
    );
  }

  try {
    const event = JSON.parse(payloadText);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        const workspaceId = session?.client_reference_id || session?.metadata?.workspaceId;
        const planTier = session?.metadata?.planTier || 'Pro';

        if (workspaceId) {
          updateSubscriptionTierStore(workspaceId, planTier, session.subscription);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data?.object;
        const workspaceId = subscription?.metadata?.workspaceId;
        const planTier = subscription?.metadata?.planTier;

        if (workspaceId && planTier) {
          updateSubscriptionTierStore(workspaceId, planTier, subscription.id);
        }
        break;
      }
      default:
        break;
    }

    return createSuccessResponse({ received: true, eventType: event.type }, 200);
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse(
      'WEBHOOK_PROCESSING_ERROR',
      error.message || 'Webhook processing failed.',
      400,
    );
  }
}
