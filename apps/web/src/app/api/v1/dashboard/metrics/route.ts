import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  listDocumentsForWorkspaceStore,
  listFoldersForWorkspaceStore,
  getDocumentAnalyticsSummaryStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

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
  const folders = listFoldersForWorkspaceStore(workspace.id);

  let totalViews = 0;
  let totalStorageBytes = 0;

  for (const doc of docs) {
    totalStorageBytes += doc.fileSize;
    const summary = getDocumentAnalyticsSummaryStore(doc.id);
    totalViews += summary.totalViews;
  }

  return createSuccessResponse(
    {
      metrics: {
        totalDocuments: docs.length,
        totalFolders: folders.length,
        totalViews,
        storageUsedBytes: totalStorageBytes,
        storageUsedMb: (totalStorageBytes / 1024 / 1024).toFixed(2),
      },
    },
    200,
  );
}
