"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'No active session token provided.', 401);
    }
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (sessionData) {
        (0, core_1.revokeSessionStore)(sessionData.session.id);
    }
    return (0, api_response_js_1.createSuccessResponse)({ message: 'Logged out successfully.' }, 200);
}
//# sourceMappingURL=route.js.map