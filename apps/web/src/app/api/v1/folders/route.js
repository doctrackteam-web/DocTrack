"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../lib/api-response.js");
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    try {
        const { name, parentId } = await request.json();
        const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
        if (!workspace) {
            return (0, api_response_js_1.createErrorResponse)('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
        }
        const folder = (0, core_1.createFolderStore)(workspace.id, sessionData.user.id, name, parentId);
        return (0, api_response_js_1.createSuccessResponse)({ folder }, 201);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('FOLDER_CREATION_FAILED', error.message || 'Folder creation failed.', 400);
    }
}
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
    const folders = (0, core_1.listFoldersForWorkspaceStore)(workspace.id);
    return (0, api_response_js_1.createSuccessResponse)({ folders }, 200);
}
//# sourceMappingURL=route.js.map