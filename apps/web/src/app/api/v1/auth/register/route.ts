import { checkRateLimit, isAccountLocked } from '@doctrack/security';
import { registerUserStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`register:${ip}`, 20, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse(
      'TOO_MANY_REQUESTS',
      'Rate limit exceeded. Please try again later.',
      429,
    );
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return createErrorResponse(
        'INVALID_PAYLOAD',
        'Missing required fields: email, password, name.',
        400,
      );
    }

    if (isAccountLocked(email).isLocked) {
      return createErrorResponse(
        'ACCOUNT_LOCKED',
        'Account is temporarily locked due to excessive failed attempts.',
        423,
      );
    }

    const { user, workspace, session, rawSessionToken } = registerUserStore(email, password, name);

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          ownerId: workspace.ownerId,
          createdAt: workspace.createdAt.toISOString(),
        },
        sessionToken: rawSessionToken,
        expiresAt: session.expiresAt.toISOString(),
      },
      201,
      {
        'Set-Cookie': `doctrack_session=${rawSessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
      },
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('REGISTRATION_FAILED', error.message || 'Registration failed.', 400);
  }
}
