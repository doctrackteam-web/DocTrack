"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const ua = request.headers.get('user-agent') || 'Unknown';
    try {
        const { token, fieldValues } = await request.json();
        if (!token) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Signing token is required.', 400);
        }
        const result = (0, core_1.submitSignatureStore)(token, fieldValues || [], ip, ua);
        return (0, api_response_js_1.createSuccessResponse)({
            success: result.success,
            isCompleted: result.isCompleted,
            certificateId: result.certificateId || null,
        }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('SIGNING_FAILED', error.message || 'Signature submission failed.', 400);
    }
}
//# sourceMappingURL=route.js.map