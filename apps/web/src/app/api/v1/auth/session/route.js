"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function GET(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Missing authorization token.', 401);
    }
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('SESSION_EXPIRED', 'Session invalid or expired.', 401);
    }
    const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
    return (0, api_response_js_1.createSuccessResponse)({
        user: {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name,
            emailVerified: sessionData.user.emailVerified,
            createdAt: sessionData.user.createdAt.toISOString(),
            updatedAt: sessionData.user.updatedAt.toISOString(),
        },
        workspace: workspace
            ? {
                id: workspace.id,
                name: workspace.name,
                slug: workspace.slug,
                ownerId: workspace.ownerId,
                createdAt: workspace.createdAt.toISOString(),
            }
            : null,
        session: {
            id: sessionData.session.id,
            expiresAt: sessionData.session.expiresAt.toISOString(),
        },
    }, 200);
}
//# sourceMappingURL=route.js.map