"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = request.headers.get('user-agent') || 'Unknown';
    try {
        const { token } = await request.json();
        if (!token) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Signing token is required.', 400);
        }
        const success = (0, core_1.declineSignatureRequestStore)(token, ip, ua);
        if (!success) {
            return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Signing session not found or expired.', 404);
        }
        return (0, api_response_js_1.createSuccessResponse)({ success: true, status: 'Declined' }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('DECLINE_FAILED', error.message || 'Decline operation failed.', 400);
    }
}
//# sourceMappingURL=route.js.map