import { generateSecureToken } from '@doctrack/security';
import {
  ViewerSessionEntity,
  AnalyticsEventEntity,
  DocumentAnalyticsSummary,
} from '../domain/analytics.js';

const sessionsMap = new Map<string, ViewerSessionEntity>();
const eventsList: AnalyticsEventEntity[] = [];

export function createViewerSessionStore(
  linkId: string,
  documentId: string,
  workspaceId: string,
  viewerIp: string,
  userAgent: string,
  country: string = 'US',
): ViewerSessionEntity {
  const sessionId = `vses_${generateSecureToken(16)}`;
  const now = new Date();

  const session: ViewerSessionEntity = {
    id: sessionId,
    linkId,
    documentId,
    workspaceId,
    viewerIp,
    userAgent,
    country,
    status: 'Active',
    createdAt: now,
    updatedAt: now,
  };

  sessionsMap.set(sessionId, session);
  return session;
}

export function recordAnalyticsEventStore(
  sessionId: string,
  documentId: string,
  linkId: string,
  workspaceId: string,
  eventType: AnalyticsEventEntity['eventType'],
  pageNumber?: number,
  durationMs?: number,
  metadata?: Record<string, unknown>,
): AnalyticsEventEntity {
  const event: AnalyticsEventEntity = {
    id: `evt_${generateSecureToken(12)}`,
    sessionId,
    documentId,
    linkId,
    workspaceId,
    eventType,
    pageNumber,
    durationMs,
    metadata,
    createdAt: new Date(),
  };

  eventsList.push(event);
  return event;
}

export function getDocumentAnalyticsSummaryStore(documentId: string): DocumentAnalyticsSummary {
  const docEvents = eventsList.filter((e) => e.documentId === documentId);
  const docSessions = Array.from(sessionsMap.values()).filter((s) => s.documentId === documentId);

  const totalViews = docSessions.length;
  const uniqueIPs = new Set(docSessions.map((s) => s.viewerIp));
  const uniqueViewers = uniqueIPs.size;

  let totalDurationMs = 0;
  const pageHeatmap: Record<number, { views: number; totalTimeMs: number }> = {};

  for (const evt of docEvents) {
    if (evt.durationMs) {
      totalDurationMs += evt.durationMs;
    }

    if (evt.pageNumber) {
      if (!pageHeatmap[evt.pageNumber]) {
        pageHeatmap[evt.pageNumber] = { views: 0, totalTimeMs: 0 };
      }
      pageHeatmap[evt.pageNumber]!.views += 1;
      if (evt.durationMs) {
        pageHeatmap[evt.pageNumber]!.totalTimeMs += evt.durationMs;
      }
    }
  }

  const averageReadTimeSeconds =
    totalViews > 0 ? Math.round(totalDurationMs / totalViews / 1000) : 0;
  const completionRatePercent =
    totalViews > 0 ? Math.min(100, Math.round((Object.keys(pageHeatmap).length / 1) * 100)) : 0;

  return {
    documentId,
    totalViews,
    uniqueViewers,
    averageReadTimeSeconds,
    completionRatePercent,
    pageHeatmap,
  };
}

export function clearAnalyticsStoreForTesting(): void {
  sessionsMap.clear();
  eventsList.length = 0;
}
