"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function GET(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
    if (!workspace) {
        return (0, api_response_js_1.createErrorResponse)('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
    }
    const docs = (0, core_1.listDocumentsForWorkspaceStore)(workspace.id);
    const folders = (0, core_1.listFoldersForWorkspaceStore)(workspace.id);
    let totalViews = 0;
    let totalStorageBytes = 0;
    for (const doc of docs) {
        totalStorageBytes += doc.fileSize;
        const summary = (0, core_1.getDocumentAnalyticsSummaryStore)(doc.id);
        totalViews += summary.totalViews;
    }
    return (0, api_response_js_1.createSuccessResponse)({
        metrics: {
            totalDocuments: docs.length,
            totalFolders: folders.length,
            totalViews,
            storageUsedBytes: totalStorageBytes,
            storageUsedMb: (totalStorageBytes / 1024 / 1024).toFixed(2),
        },
    }, 200);
}
//# sourceMappingURL=route.js.map