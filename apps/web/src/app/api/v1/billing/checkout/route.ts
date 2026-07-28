import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  StripeIntegrationDriver,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

const stripe = new StripeIntegrationDriver();

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  try {
    const isBillingEnabled = process.env.BILLING_ENABLED === 'true';

    if (!isBillingEnabled) {
      return createSuccessResponse(
        {
          isBeta: true,
          message:
            'Beta – Payments Coming Soon. All Pro features are currently free during public beta.',
        },
        200,
      );
    }

    const { planTier, interval } = await request.json();

    if (!planTier || (planTier !== 'Pro' && planTier !== 'Business')) {
      return createErrorResponse(
        'INVALID_PAYLOAD',
        'Valid target planTier (Pro or Business) is required.',
        400,
      );
    }

    const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);
    if (!workspace) {
      return createErrorResponse('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
    }

    const checkout = await stripe.createCheckoutSession(
      workspace.id,
      sessionData.user.email,
      planTier,
      interval,
    );

    return createSuccessResponse({ checkout }, 200);
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('CHECKOUT_FAILED', error.message || 'Checkout session failed.', 400);
  }
}
