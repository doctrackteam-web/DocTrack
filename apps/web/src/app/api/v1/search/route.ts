import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  globalSearchWorkspaceStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../lib/api-response.js';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);
  if (!workspace) {
    return createErrorResponse('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
  }

  const results = globalSearchWorkspaceStore(workspace.id, q);
  return createSuccessResponse({ query: q, results }, 200);
}
