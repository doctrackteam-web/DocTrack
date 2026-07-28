export interface ViewerSessionEntity {
  id: string;
  linkId: string;
  documentId: string;
  workspaceId: string;
  viewerIp: string;
  userAgent: string;
  country: string;
  status: 'Created' | 'Active' | 'Idle' | 'Completed' | 'Expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsEventEntity {
  id: string;
  sessionId: string;
  documentId: string;
  linkId: string;
  workspaceId: string;
  eventType:
    'DOCUMENT_OPENED' | 'PAGE_VIEWED' | 'PAGE_CHANGED' | 'TIME_ON_PAGE' | 'DOCUMENT_CLOSED';
  pageNumber?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface DocumentAnalyticsSummary {
  documentId: string;
  totalViews: number;
  uniqueViewers: number;
  averageReadTimeSeconds: number;
  completionRatePercent: number;
  pageHeatmap: Record<number, { views: number; totalTimeMs: number }>;
}
