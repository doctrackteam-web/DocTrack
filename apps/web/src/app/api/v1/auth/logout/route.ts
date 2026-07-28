import { validateSessionStore, revokeSessionStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return createErrorResponse('UNAUTHORIZED', 'No active session token provided.', 401);
  }

  const sessionData = validateSessionStore(token);
  if (sessionData) {
    revokeSessionStore(sessionData.session.id);
  }

  return createSuccessResponse({ message: 'Logged out successfully.' }, 200);
}
