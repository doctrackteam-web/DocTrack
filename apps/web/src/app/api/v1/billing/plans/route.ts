import { PLAN_LIMITS } from '@doctrack/core';
import { createSuccessResponse } from '../../../../../lib/api-response.js';

export async function GET() {
  return createSuccessResponse(
    {
      plans: [
        {
          tier: 'Free',
          name: 'Free Starter',
          priceMonthly: 0,
          priceYearly: 0,
          limits: PLAN_LIMITS.Free,
        },
        {
          tier: 'Pro',
          name: 'Pro Professional',
          priceMonthly: 29,
          priceYearly: 290,
          limits: PLAN_LIMITS.Pro,
        },
        {
          tier: 'Business',
          name: 'Business Enterprise',
          priceMonthly: 99,
          priceYearly: 990,
          limits: PLAN_LIMITS.Business,
        },
      ],
    },
    200,
  );
}
