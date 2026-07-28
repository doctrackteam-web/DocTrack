"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../../lib/api-response.js");
async function GET(request, { params }) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const documentId = params.id;
    const doc = (0, core_1.getDocumentByIdStore)(documentId);
    if (!doc || doc.ownerId !== sessionData.user.id) {
        return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Document not found.', 404);
    }
    const summary = (0, core_1.getDocumentAnalyticsSummaryStore)(doc.id);
    return (0, api_response_js_1.createSuccessResponse)({
        analytics: {
            documentId: summary.documentId,
            title: doc.title,
            totalViews: summary.totalViews,
            uniqueViewers: summary.uniqueViewers,
            averageReadTimeSeconds: summary.averageReadTimeSeconds,
            completionRatePercent: summary.completionRatePercent,
            pageHeatmap: summary.pageHeatmap,
        },
    }, 200);
}
//# sourceMappingURL=route.js.map