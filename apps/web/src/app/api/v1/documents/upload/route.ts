import { checkRateLimit } from '@doctrack/security';
import {
  validateSessionStore,
  getDefaultWorkspaceForUserStore,
  createDocumentStore,
  LocalStorageProvider,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

const storageProvider = new LocalStorageProvider();

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const rateLimit = checkRateLimit(`upload:${sessionData.user.id}`, 10, 60000);
  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Document upload rate limit exceeded.', 429);
  }

  try {
    const { title, fileName, fileSize, mimeType } = await request.json();

    if (!title || !fileName || !fileSize) {
      return createErrorResponse(
        'INVALID_PAYLOAD',
        'Title, fileName, and fileSize are required.',
        400,
      );
    }

    if (mimeType && mimeType !== 'application/pdf') {
      return createErrorResponse(
        'UNSUPPORTED_MEDIA_TYPE',
        'Only PDF documents (application/pdf) are supported.',
        415,
      );
    }

    if (fileSize > 50 * 1024 * 1024) {
      // 50MB limit
      return createErrorResponse('PAYLOAD_TOO_LARGE', 'File size exceeds maximum 50MB limit.', 413);
    }

    const workspace = getDefaultWorkspaceForUserStore(sessionData.user.id);
    if (!workspace) {
      return createErrorResponse('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
    }

    const fileKey = `workspaces/${workspace.id}/docs/${Date.now()}-${fileName.replace(/[^\w.-]/g, '_')}`;
    const doc = createDocumentStore(
      workspace.id,
      sessionData.user.id,
      title,
      fileKey,
      fileSize,
      'application/pdf',
    );

    const presigned = await storageProvider.createPresignedUploadUrl(fileKey, 'application/pdf');

    return createSuccessResponse(
      {
        documentId: doc.id,
        fileKey,
        uploadUrl: presigned.uploadUrl,
        headers: presigned.headers,
        expiresAt: presigned.expiresAt.toISOString(),
      },
      201,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('UPLOAD_INITIATION_FAILED', error.message || 'Upload failed.', 400);
  }
}
