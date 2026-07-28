import { verifyPassword, checkRateLimit } from '@doctrack/security';
import {
  getSharingLinkBySlugStore,
  validateLinkAccess,
  incrementLinkViewsStore,
  getDocumentByIdStore,
  createViewerSessionStore,
  recordAnalyticsEventStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`view-access:${ip}`, 30, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Rate limit exceeded.', 429);
  }

  try {
    const { slug, password } = await request.json();

    if (!slug) {
      return createErrorResponse('INVALID_PAYLOAD', 'Link slug is required.', 400);
    }

    const link = getSharingLinkBySlugStore(slug);
    if (!link) {
      return createErrorResponse('NOT_FOUND', 'Sharing link not found or expired.', 404);
    }

    // Check link expiration, max views, revocation, and password
    const validation = validateLinkAccess(link, password);
    if (!validation.allowed) {
      if (link.isPasswordProtected && !password) {
        return createErrorResponse(
          'PASSWORD_REQUIRED',
          'This document is password protected.',
          401,
        );
      }
      return createErrorResponse('LINK_ACCESS_DENIED', validation.reason || 'Access denied.', 403);
    }

    if (link.isPasswordProtected && password && link.passwordHash) {
      if (!verifyPassword(password, link.passwordHash)) {
        return createErrorResponse('INVALID_PASSWORD', 'Incorrect document password.', 401);
      }
    }

    const doc = getDocumentByIdStore(link.documentId);
    if (!doc) {
      return createErrorResponse('NOT_FOUND', 'Target document is no longer available.', 404);
    }

    // Increment views & create active viewer session
    incrementLinkViewsStore(link.id);
    const session = createViewerSessionStore(
      link.id,
      doc.id,
      doc.workspaceId,
      ip,
      request.headers.get('user-agent') || 'Unknown',
    );

    // Record initial DOCUMENT_OPENED analytics event
    recordAnalyticsEventStore(session.id, doc.id, link.id, doc.workspaceId, 'DOCUMENT_OPENED');

    return createSuccessResponse(
      {
        sessionId: session.id,
        document: {
          title: doc.title,
          pageCount: doc.pageCount,
          allowDownload: link.allowDownload,
        },
      },
      200,
      { 'X-Frame-Options': 'SAMEORIGIN' },
    );
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse('ACCESS_ERROR', error.message || 'Access failed.', 400);
  }
}
