import { checkRateLimit } from '@doctrack/security';
import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  createFolderStore,
  listFoldersForWorkspaceStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../lib/api-response.js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  try {
    const { name, parentId } = await request.json();

    const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);
    if (!workspace) {
      return createErrorResponse('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
    }

    const folder = createFolderStore(workspace.id, sessionData.user.id, name, parentId);

    return createSuccessResponse({ folder }, 201);
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse(
      'FOLDER_CREATION_FAILED',
      error.message || 'Folder creation failed.',
      400,
    );
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);
  if (!workspace) {
    return createErrorResponse('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
  }

  const folders = listFoldersForWorkspaceStore(workspace.id);
  return createSuccessResponse({ folders }, 200);
}
