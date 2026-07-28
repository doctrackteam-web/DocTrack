"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = (0, security_1.checkRateLimit)(`login:${ip}`, 20, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Too many login attempts. Please wait 1 minute.', 429);
    }
    try {
        const body = await request.json();
        const { email, password } = body;
        if (!email || !password) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Email and password are required.', 400);
        }
        const lockStatus = (0, security_1.isAccountLocked)(email);
        if (lockStatus.isLocked) {
            return (0, api_response_js_1.createErrorResponse)('ACCOUNT_LOCKED', 'Account locked due to 5 consecutive failed login attempts. Try again in 15 minutes.', 423);
        }
        const user = (0, core_1.getUserByEmailStore)(email);
        if (!user || !(0, security_1.verifyPassword)(password, user.passwordHash)) {
            const failedInfo = (0, security_1.recordFailedLogin)(email);
            return (0, api_response_js_1.createErrorResponse)('INVALID_CREDENTIALS', failedInfo.isLocked
                ? 'Account locked due to 5 failed attempts.'
                : `Invalid email or password. ${failedInfo.remainingAttempts} attempts remaining.`, 401);
        }
        // Reset failed attempts on successful login
        (0, security_1.resetFailedLoginAttempts)(email);
        // Session rotation on login
        const { session, rawSessionToken } = (0, core_1.createSessionStore)(user.id, ip);
        const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(user.id);
        return (0, api_response_js_1.createSuccessResponse)({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
            defaultWorkspace: workspace
                ? {
                    id: workspace.id,
                    name: workspace.name,
                    slug: workspace.slug,
                    ownerId: workspace.ownerId,
                    createdAt: workspace.createdAt.toISOString(),
                }
                : null,
            expiresAt: session.expiresAt.toISOString(),
        }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('LOGIN_FAILED', error.message || 'Login failed.', 400);
    }
}
//# sourceMappingURL=route.js.map