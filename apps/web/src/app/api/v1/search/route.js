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
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
    if (!workspace) {
        return (0, api_response_js_1.createErrorResponse)('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
    }
    const results = (0, core_1.globalSearchWorkspaceStore)(workspace.id, q);
    return (0, api_response_js_1.createSuccessResponse)({ query: q, results }, 200);
}
//# sourceMappingURL=route.js.map