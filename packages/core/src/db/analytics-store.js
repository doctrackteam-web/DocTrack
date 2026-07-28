"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViewerSessionStore = createViewerSessionStore;
exports.recordAnalyticsEventStore = recordAnalyticsEventStore;
exports.getDocumentAnalyticsSummaryStore = getDocumentAnalyticsSummaryStore;
exports.clearAnalyticsStoreForTesting = clearAnalyticsStoreForTesting;
const security_1 = require("@doctrack/security");
const sessionsMap = new Map();
const eventsList = [];
function createViewerSessionStore(linkId, documentId, workspaceId, viewerIp, userAgent, country = 'US') {
    const sessionId = `vses_${(0, security_1.generateSecureToken)(16)}`;
    const now = new Date();
    const session = {
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
function recordAnalyticsEventStore(sessionId, documentId, linkId, workspaceId, eventType, pageNumber, durationMs, metadata) {
    const event = {
        id: `evt_${(0, security_1.generateSecureToken)(12)}`,
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
function getDocumentAnalyticsSummaryStore(documentId) {
    const docEvents = eventsList.filter((e) => e.documentId === documentId);
    const docSessions = Array.from(sessionsMap.values()).filter((s) => s.documentId === documentId);
    const totalViews = docSessions.length;
    const uniqueIPs = new Set(docSessions.map((s) => s.viewerIp));
    const uniqueViewers = uniqueIPs.size;
    let totalDurationMs = 0;
    const pageHeatmap = {};
    for (const evt of docEvents) {
        if (evt.durationMs) {
            totalDurationMs += evt.durationMs;
        }
        if (evt.pageNumber) {
            if (!pageHeatmap[evt.pageNumber]) {
                pageHeatmap[evt.pageNumber] = { views: 0, totalTimeMs: 0 };
            }
            pageHeatmap[evt.pageNumber].views += 1;
            if (evt.durationMs) {
                pageHeatmap[evt.pageNumber].totalTimeMs += evt.durationMs;
            }
        }
    }
    const averageReadTimeSeconds = totalViews > 0 ? Math.round(totalDurationMs / totalViews / 1000) : 0;
    const completionRatePercent = totalViews > 0 ? Math.min(100, Math.round((Object.keys(pageHeatmap).length / 1) * 100)) : 0;
    return {
        documentId,
        totalViews,
        uniqueViewers,
        averageReadTimeSeconds,
        completionRatePercent,
        pageHeatmap,
    };
}
function clearAnalyticsStoreForTesting() {
    sessionsMap.clear();
    eventsList.length = 0;
}
//# sourceMappingURL=analytics-store.js.map