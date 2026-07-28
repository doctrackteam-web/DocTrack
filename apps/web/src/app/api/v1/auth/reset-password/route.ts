import { checkRateLimit } from '@doctrack/security';
import { resetPasswordWithTokenStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`reset-password:${ip}`, 5, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Too many attempts.', 429);
  }

  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return createErrorResponse('INVALID_PAYLOAD', 'Token and newPassword are required.', 400);
    }

    const success = resetPasswordWithTokenStore(token, newPassword);
    if (!success) {
      return createErrorResponse(
        'INVALID_OR_EXPIRED_TOKEN',
        'Reset token is invalid, expired, or password policy failed.',
        400,
      );
    }

    return createSuccessResponse(
      { message: 'Password has been reset successfully. Existing sessions revoked.' },
      200,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('RESET_PASSWORD_FAILED', error.message || 'Reset failed.', 400);
  }
}
