"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const rateLimit = (0, security_1.checkRateLimit)(`sig-req:${sessionData.user.id}`, 20, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Signature request creation limit reached.', 429);
    }
    try {
        const { documentId, title, participants, fields } = await request.json();
        if (!documentId || !participants || !Array.isArray(participants) || participants.length === 0) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'documentId and at least one participant are required.', 400);
        }
        const doc = (0, core_1.getDocumentByIdStore)(documentId);
        if (!doc || doc.ownerId !== sessionData.user.id) {
            return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Document not found.', 404);
        }
        const { request: sigReq, signerTokens } = (0, core_1.createSignatureRequestStore)(doc.id, doc.workspaceId, sessionData.user.id, title || doc.title, participants, fields || []);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        return (0, api_response_js_1.createSuccessResponse)({
            requestId: sigReq.id,
            status: sigReq.status,
            signerLinks: signerTokens.map((st) => ({
                email: st.email,
                url: `${appUrl}/sign/${st.token}`,
            })),
        }, 201);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('SIGNATURE_REQUEST_FAILED', error.message || 'Signature request failed.', 400);
    }
}
//# sourceMappingURL=route.js.map