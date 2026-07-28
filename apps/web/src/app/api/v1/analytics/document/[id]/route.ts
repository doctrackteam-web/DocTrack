import {
  validateSessionStore,
  getDocumentByIdStore,
  getDocumentAnalyticsSummaryStore,
} from '@doctrack/core';
import { createSuccessResponse, createErrorResponse } from '../../../../../../lib/api-response.js';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const sessionData = validateSessionStore(token);
  if (!sessionData) {
    return createErrorResponse('UNAUTHORIZED', 'Authentication required.', 401);
  }

  const documentId = params.id;
  const doc = getDocumentByIdStore(documentId);
  if (!doc || doc.ownerId !== sessionData.user.id) {
    return createErrorResponse('NOT_FOUND', 'Document not found.', 404);
  }

  const summary = getDocumentAnalyticsSummaryStore(doc.id);

  return createSuccessResponse(
    {
      analytics: {
        documentId: summary.documentId,
        title: doc.title,
        totalViews: summary.totalViews,
        uniqueViewers: summary.uniqueViewers,
        averageReadTimeSeconds: summary.averageReadTimeSeconds,
        completionRatePercent: summary.completionRatePercent,
        pageHeatmap: summary.pageHeatmap,
      },
    },
    200,
  );
}
