"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
const email_service_js_1 = require("../../../../../lib/email/email-service.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = (0, security_1.checkRateLimit)(`forgot-password:${ip}`, 3, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Rate limit exceeded.', 429);
    }
    try {
        const { email } = await request.json();
        if (!email) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Email is required.', 400);
        }
        const resetToken = (0, core_1.createPasswordResetTokenStore)(email);
        if (resetToken) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
            const emailHtml = (0, email_service_js_1.renderPasswordResetEmailHtml)(email.split('@')[0] || 'User', resetUrl);
            await (0, email_service_js_1.sendTransactionalEmail)({
                to: email,
                subject: 'Reset your DocTrack Password',
                html: emailHtml,
            });
        }
        // Security practice: Return success even if email not found to prevent user enumeration
        return (0, api_response_js_1.createSuccessResponse)({
            message: 'If an account exists for this email, password reset instructions have been dispatched.',
            resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
        }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('FORGOT_PASSWORD_FAILED', error.message || 'Request failed.', 400);
    }
}
//# sourceMappingURL=route.js.map