import {
  checkRateLimit,
  isAccountLocked,
  recordFailedLogin,
  resetFailedLoginAttempts,
  verifyPassword,
} from '@doctrack/security';
import {
  getUserByEmailStore,
  createSessionStore,
  getDefaultWorkspaceForUserStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`login:${ip}`, 20, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse(
      'TOO_MANY_REQUESTS',
      'Too many login attempts. Please wait 1 minute.',
      429,
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return createErrorResponse('INVALID_PAYLOAD', 'Email and password are required.', 400);
    }

    const lockStatus = isAccountLocked(email);
    if (lockStatus.isLocked) {
      return createErrorResponse(
        'ACCOUNT_LOCKED',
        'Account locked due to 5 consecutive failed login attempts. Try again in 15 minutes.',
        423,
      );
    }

    const user = getUserByEmailStore(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      const failedInfo = recordFailedLogin(email);
      return createErrorResponse(
        'INVALID_CREDENTIALS',
        failedInfo.isLocked
          ? 'Account locked due to 5 failed attempts.'
          : `Invalid email or password. ${failedInfo.remainingAttempts} attempts remaining.`,
        401,
      );
    }

    // Reset failed attempts on successful login
    resetFailedLoginAttempts(email);

    // Session rotation on login
    const { session, rawSessionToken } = createSessionStore(user.id, ip);
    const workspace = getDefaultWorkspaceForUserStore(user.id);

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
        defaultWorkspace: workspace
          ? {
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              ownerId: workspace.ownerId,
              createdAt: workspace.createdAt.toISOString(),
            }
          : null,
        expiresAt: session.expiresAt.toISOString(),
      },
      200,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('LOGIN_FAILED', error.message || 'Login failed.', 400);
  }
}
