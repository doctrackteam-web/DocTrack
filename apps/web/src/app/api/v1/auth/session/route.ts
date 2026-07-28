import { validateSessionStore, getDefaultWorkspaceForUserStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return createErrorResponse('UNAUTHORIZED', 'Missing authorization token.', 401);
  }

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('SESSION_EXPIRED', 'Session invalid or expired.', 401);
  }

  const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);

  return createSuccessResponse(
    {
      user: {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        emailVerified: sessionData.user.emailVerified,
        createdAt: sessionData.user.createdAt.toISOString(),
        updatedAt: sessionData.user.updatedAt.toISOString(),
      },
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            ownerId: workspace.ownerId,
            createdAt: workspace.createdAt.toISOString(),
          }
        : null,
      session: {
        id: sessionData.session.id,
        expiresAt: sessionData.session.expiresAt.toISOString(),
      },
    },
    200,
  );
}
