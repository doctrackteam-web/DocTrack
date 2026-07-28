import { checkRateLimit } from '@doctrack/security';
import { verifyEmailTokenStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`verify-email:${ip}`, 5, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Too many verification attempts.', 429);
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return createErrorResponse('INVALID_PAYLOAD', 'Token is required.', 400);
    }

    const success = verifyEmailTokenStore(token);
    if (!success) {
      return createErrorResponse(
        'INVALID_OR_EXPIRED_TOKEN',
        'Verification token is invalid or expired.',
        400,
      );
    }

    return createSuccessResponse({ message: 'Email address verified successfully.' }, 200);
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('VERIFICATION_FAILED', error.message || 'Verification failed.', 400);
  }
}
