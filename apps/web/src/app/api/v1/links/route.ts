import { checkRateLimit, verifyPassword } from '@doctrack/security';
import {
  validateSessionStore,
  getDocumentByIdStore,
  createSharingLinkStore,
  listSharingLinksForDocumentStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../lib/api-response.js';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const rateLimit = checkRateLimit(`create-link:${sessionData.user.id}`, 20, 60000);
  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Sharing link generation limit reached.', 429);
  }

  try {
    const { documentId, password, expiresAt, maxViews, allowDownload, customSlug } =
      await request.json();

    if (!documentId) {
      return createErrorResponse('INVALID_PAYLOAD', 'documentId is required.', 400);
    }

    const doc = getDocumentByIdStore(documentId);
    if (!doc || doc.ownerId !== sessionData.user.id) {
      return createErrorResponse('NOT_FOUND', 'Document not found.', 404);
    }

    const link = createSharingLinkStore(doc.id, doc.workspaceId, sessionData.user.id, {
      password,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxViews,
      allowDownload,
      customSlug,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return createSuccessResponse(
      {
        link: {
          id: link.id,
          documentId: link.documentId,
          slug: link.slug,
          url: `${appUrl}/v/${link.slug}`,
          isPasswordProtected: link.isPasswordProtected,
          expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
          maxViews: link.maxViews || null,
          currentViews: link.currentViews,
          isRevoked: link.isRevoked,
          createdAt: link.createdAt.toISOString(),
        },
      },
      201,
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse(
      'LINK_CREATION_FAILED',
      error.message || 'Failed to generate link.',
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

  const url = new URL(request.url);
  const documentId = url.searchParams.get('documentId');

  if (!documentId) {
    return createErrorResponse('INVALID_PAYLOAD', 'documentId query parameter is required.', 400);
  }

  const doc = getDocumentByIdStore(documentId);
  if (!doc || doc.ownerId !== sessionData.user.id) {
    return createErrorResponse('NOT_FOUND', 'Document not found.', 404);
  }

  const links = listSharingLinksForDocumentStore(doc.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return createSuccessResponse(
    {
      links: links.map((link) => ({
        id: link.id,
        documentId: link.documentId,
        slug: link.slug,
        url: `${appUrl}/v/${link.slug}`,
        isPasswordProtected: link.isPasswordProtected,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        maxViews: link.maxViews || null,
        currentViews: link.currentViews,
        isRevoked: link.isRevoked,
        createdAt: link.createdAt.toISOString(),
      })),
    },
    200,
  );
}
