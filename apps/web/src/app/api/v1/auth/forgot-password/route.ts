import { checkRateLimit } from '@doctrack/security';
import { createPasswordResetTokenStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';
import {
  sendTransactionalEmail,
  renderPasswordResetEmailHtml,
} from '../../../../../lib/email/email-service.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Rate limit exceeded.', 429);
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return createErrorResponse('INVALID_PAYLOAD', 'Email is required.', 400);
    }

    const resetToken = createPasswordResetTokenStore(email);

    if (resetToken) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
      const emailHtml = renderPasswordResetEmailHtml(email.split('@')[0] || 'User', resetUrl);

      await sendTransactionalEmail({
        to: email,
        subject: 'Reset your DocTrack Password',
        html: emailHtml,
      });
    }

    // Security practice: Return success even if email not found to prevent user enumeration
    return createSuccessResponse(
      {
        message:
          'If an account exists for this email, password reset instructions have been dispatched.',
        resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
      },
      200,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('FORGOT_PASSWORD_FAILED', error.message || 'Request failed.', 400);
  }
}
