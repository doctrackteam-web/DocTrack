"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
const storageProvider = new core_1.LocalStorageProvider();
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    const rateLimit = (0, security_1.checkRateLimit)(`upload:${sessionData.user.id}`, 10, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Document upload rate limit exceeded.', 429);
    }
    try {
        const { title, fileName, fileSize, mimeType } = await request.json();
        if (!title || !fileName || !fileSize) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'Title, fileName, and fileSize are required.', 400);
        }
        if (mimeType && mimeType !== 'application/pdf') {
            return (0, api_response_js_1.createErrorResponse)('UNSUPPORTED_MEDIA_TYPE', 'Only PDF documents (application/pdf) are supported.', 415);
        }
        if (fileSize > 50 * 1024 * 1024) {
            // 50MB limit
            return (0, api_response_js_1.createErrorResponse)('PAYLOAD_TOO_LARGE', 'File size exceeds maximum 50MB limit.', 413);
        }
        const workspace = (0, core_1.getDefaultWorkspaceForUserStore)(sessionData.user.id);
        if (!workspace) {
            return (0, api_response_js_1.createErrorResponse)('WORKSPACE_NOT_FOUND', 'No active workspace found.', 404);
        }
        const fileKey = `workspaces/${workspace.id}/docs/${Date.now()}-${fileName.replace(/[^\w.-]/g, '_')}`;
        const doc = (0, core_1.createDocumentStore)(workspace.id, sessionData.user.id, title, fileKey, fileSize, 'application/pdf');
        const presigned = await storageProvider.createPresignedUploadUrl(fileKey, 'application/pdf');
        return (0, api_response_js_1.createSuccessResponse)({
            documentId: doc.id,
            fileKey,
            uploadUrl: presigned.uploadUrl,
            headers: presigned.headers,
            expiresAt: presigned.expiresAt.toISOString(),
        }, 201);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('UPLOAD_INITIATION_FAILED', error.message || 'Upload failed.', 400);
    }
}
//# sourceMappingURL=route.js.map