import { checkRateLimit } from '@doctrack/security';
import {
  validateSessionStore,
  getDocumentByIdStore,
  createSignatureRequestStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const rateLimit = checkRateLimit(`sig-req:${sessionData.user.id}`, 20, 60000);
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'TOO_MANY_REQUESTS',
      'Signature request creation limit reached.',
      429,
    );
  }

  try {
    const { documentId, title, participants, fields } = await request.json();

    if (!documentId || !participants || !Array.isArray(participants) || participants.length === 0) {
      return createErrorResponse(
        'INVALID_PAYLOAD',
        'documentId and at least one participant are required.',
        400,
      );
    }

    const doc = getDocumentByIdStore(documentId);
    if (!doc || doc.ownerId !== sessionData.user.id) {
      return createErrorResponse('NOT_FOUND', 'Document not found.', 404);
    }

    const { request: sigReq, signerTokens } = createSignatureRequestStore(
      doc.id,
      doc.workspaceId,
      sessionData.user.id,
      title || doc.title,
      participants,
      fields || [],
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return createSuccessResponse(
      {
        requestId: sigReq.id,
        status: sigReq.status,
        signerLinks: signerTokens.map((st) => ({
          email: st.email,
          url: `${appUrl}/sign/${st.token}`,
        })),
      },
      201,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse(
      'SIGNATURE_REQUEST_FAILED',
      error.message || 'Signature request failed.',
      400,
    );
  }
}
