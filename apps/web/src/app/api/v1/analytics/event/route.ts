import { checkRateLimit } from '@doctrack/security';
import { recordAnalyticsEventStore } from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../lib/api-response.js';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`analytics:${ip}`, 100, 60000);

  if (!rateLimit.allowed) {
    return createErrorResponse('TOO_MANY_REQUESTS', 'Rate limit exceeded.', 429);
  }

  try {
    const {
      sessionId,
      documentId,
      linkId,
      workspaceId,
      eventType,
      pageNumber,
      durationMs,
      metadata,
    } = await request.json();

    if (!sessionId || !documentId || !linkId || !eventType) {
      return createErrorResponse(
        'INVALID_PAYLOAD',
        'sessionId, documentId, linkId, and eventType are required.',
        400,
      );
    }

    const event = recordAnalyticsEventStore(
      sessionId,
      documentId,
      linkId,
      workspaceId || 'default',
      eventType,
      pageNumber,
      durationMs,
      metadata,
    );

    return createSuccessResponse({ eventId: event.id }, 201);
  } catch (err: unknown) {
    const error = err as Error;
    return createErrorResponse(
      'EVENT_RECORD_FAILED',
      error.message || 'Event recording failed.',
      400,
    );
  }
}
