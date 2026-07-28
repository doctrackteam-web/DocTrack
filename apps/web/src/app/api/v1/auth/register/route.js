"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = (0, security_1.checkRateLimit)(`register:${ip}`, 20, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Rate limit exceeded. Please try again later.', 429);
    }
    try {
        const body = await request.json();
        const { email, password, name } = body;
        if (!email || !password || !name) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Missing required fields: email, password, name.', 400);
        }
        if ((0, security_1.isAccountLocked)(email).isLocked) {
            return (0, api_response_js_1.createErrorResponse)('ACCOUNT_LOCKED', 'Account is temporarily locked due to excessive failed attempts.', 423);
        }
        const { user, workspace, session, rawSessionToken } = (0, core_1.registerUserStore)(email, password, name);
        return (0, api_response_js_1.createSuccessResponse)({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
            },
            workspace: {
                id: workspace.id,
                name: workspace.name,
                slug: workspace.slug,
                ownerId: workspace.ownerId,
                createdAt: workspace.createdAt.toISOString(),
            },
            sessionToken: rawSessionToken,
            expiresAt: session.expiresAt.toISOString(),
        }, 201, {
            'Set-Cookie': `doctrack_session=${rawSessionToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`,
        });
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('REGISTRATION_FAILED', error.message || 'Registration failed.', 400);
    }
}
//# sourceMappingURL=route.js.map