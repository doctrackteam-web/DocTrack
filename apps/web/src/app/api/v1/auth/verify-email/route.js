"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = (0, security_1.checkRateLimit)(`verify-email:${ip}`, 5, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Too many verification attempts.', 429);
    }
    try {
        const { token } = await request.json();
        if (!token) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Token is required.', 400);
        }
        const success = (0, core_1.verifyEmailTokenStore)(token);
        if (!success) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_OR_EXPIRED_TOKEN', 'Verification token is invalid or expired.', 400);
        }
        return (0, api_response_js_1.createSuccessResponse)({ message: 'Email address verified successfully.' }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('VERIFICATION_FAILED', error.message || 'Verification failed.', 400);
    }
}
//# sourceMappingURL=route.js.map