"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../lib/api-response.js");
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
    return (0, api_response_js_1.createSuccessResponse)({
        documents: docs.map((doc) => ({
            id: doc.id,
            workspaceId: doc.workspaceId,
            title: doc.title,
            fileSize: doc.fileSize,
            pageCount: doc.pageCount,
            status: doc.status,
            createdAt: doc.createdAt.toISOString(),
            updatedAt: doc.updatedAt.toISOString(),
        })),
    }, 200);
}
//# sourceMappingURL=route.js.map