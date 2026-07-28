"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../lib/api-response.js");
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const rateLimit = (0, security_1.checkRateLimit)(`create-link:${sessionData.user.id}`, 20, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Sharing link generation limit reached.', 429);
    }
    try {
        const { documentId, password, expiresAt, maxViews, allowDownload, customSlug } = await request.json();
        if (!documentId) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'documentId is required.', 400);
        }
        const doc = (0, core_1.getDocumentByIdStore)(documentId);
        if (!doc || doc.ownerId !== sessionData.user.id) {
            return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Document not found.', 404);
        }
        const link = (0, core_1.createSharingLinkStore)(doc.id, doc.workspaceId, sessionData.user.id, {
            password,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            maxViews,
            allowDownload,
            customSlug,
        });
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return (0, api_response_js_1.createSuccessResponse)({
            link: {
                id: link.id,
                documentId: link.documentId,
                slug: link.slug,
                url: `${appUrl}/v/${link.slug}`,
                isPasswordProtected: link.isPasswordProtected,
                expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
                maxViews: link.maxViews || null,
                currentViews: link.currentViews,
                isRevoked: link.isRevoked,
                createdAt: link.createdAt.toISOString(),
            },
        }, 201);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('LINK_CREATION_FAILED', error.message || 'Failed to generate link.', 400);
    }
}
async function GET(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    if (!documentId) {
        return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'documentId query parameter is required.', 400);
    }
    const doc = (0, core_1.getDocumentByIdStore)(documentId);
    if (!doc || doc.ownerId !== sessionData.user.id) {
        return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Document not found.', 404);
    }
    const links = (0, core_1.listSharingLinksForDocumentStore)(doc.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return (0, api_response_js_1.createSuccessResponse)({
        links: links.map((link) => ({
            id: link.id,
            documentId: link.documentId,
            slug: link.slug,
            url: `${appUrl}/v/${link.slug}`,
            isPasswordProtected: link.isPasswordProtected,
            expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
            maxViews: link.maxViews || null,
            currentViews: link.currentViews,
            isRevoked: link.isRevoked,
            createdAt: link.createdAt.toISOString(),
        })),
    }, 200);
}
//# sourceMappingURL=route.js.map