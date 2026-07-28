import {
  ViewerSessionEntity,
  AnalyticsEventEntity,
  DocumentAnalyticsSummary,
} from '../domain/analytics.js';
export declare function createViewerSessionStore(
  linkId: string,
  documentId: string,
  workspaceId: string,
  viewerIp: string,
  userAgent: string,
  country?: string,
): ViewerSessionEntity;
export declare function recordAnalyticsEventStore(
  sessionId: string,
  documentId: string,
  linkId: string,
  workspaceId: string,
  eventType: AnalyticsEventEntity['eventType'],
  pageNumber?: number,
  durationMs?: number,
  metadata?: Record<string, unknown>,
): AnalyticsEventEntity;
export declare function getDocumentAnalyticsSummaryStore(
  documentId: string,
): DocumentAnalyticsSummary;
export declare function clearAnalyticsStoreForTesting(): void;
//# sourceMappingURL=analytics-store.d.ts.map
