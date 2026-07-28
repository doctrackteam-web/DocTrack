import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  listDocumentsForWorkspaceStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../lib/api-response.js';

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

  const docs = listDocumentsForWorkspaceStore(workspace.id);

  return createSuccessResponse(
    {
      documents: docs.map((doc) => ({
        id: doc.id,
        workspaceId: doc.workspaceId,
        title: doc.title,
        fileSize: doc.fileSize,
        pageCount: doc.pageCount,
        status: doc.status,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
    },
    200,
  );
}
