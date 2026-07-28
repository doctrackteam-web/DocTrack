"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = (0, security_1.checkRateLimit)(`view-access:${ip}`, 30, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Rate limit exceeded.', 429);
    }
    try {
        const { slug, password } = await request.json();
        if (!slug) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Link slug is required.', 400);
        }
        const link = (0, core_1.getSharingLinkBySlugStore)(slug);
        if (!link) {
            return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Sharing link not found or expired.', 404);
        }
        // Check link expiration, max views, revocation, and password
        const validation = (0, core_1.validateLinkAccess)(link, password);
        if (!validation.allowed) {
            if (link.isPasswordProtected && !password) {
                return (0, api_response_js_1.createErrorResponse)('PASSWORD_REQUIRED', 'This document is password protected.', 401);
            }
            return (0, api_response_js_1.createErrorResponse)('LINK_ACCESS_DENIED', validation.reason || 'Access denied.', 403);
        }
        if (link.isPasswordProtected && password && link.passwordHash) {
            if (!(0, security_1.verifyPassword)(password, link.passwordHash)) {
                return (0, api_response_js_1.createErrorResponse)('INVALID_PASSWORD', 'Incorrect document password.', 401);
            }
        }
        const doc = (0, core_1.getDocumentByIdStore)(link.documentId);
        if (!doc) {
            return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Target document is no longer available.', 404);
        }
        // Increment views & create active viewer session
        (0, core_1.incrementLinkViewsStore)(link.id);
        const session = (0, core_1.createViewerSessionStore)(link.id, doc.id, doc.workspaceId, ip, request.headers.get('user-agent') || 'Unknown');
        // Record initial DOCUMENT_OPENED analytics event
        (0, core_1.recordAnalyticsEventStore)(session.id, doc.id, link.id, doc.workspaceId, 'DOCUMENT_OPENED');
        return (0, api_response_js_1.createSuccessResponse)({
            sessionId: session.id,
            document: {
                title: doc.title,
                pageCount: doc.pageCount,
                allowDownload: link.allowDownload,
            },
        }, 200, { 'X-Frame-Options': 'SAMEORIGIN' });
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('ACCESS_ERROR', error.message || 'Access failed.', 400);
    }
}
//# sourceMappingURL=route.js.map