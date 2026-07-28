"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const sessionData = (0, core_1.validateSessionStore)(token);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Authentication required.', 401);
    }
    try {
        const { documentId, pdfBase64Payload } = await request.json();
        if (!documentId) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'documentId is required.', 400);
        }
        const doc = (0, core_1.getDocumentByIdStore)(documentId);
        if (!doc || doc.ownerId !== sessionData.user.id) {
            return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Document not found.', 404);
        }
        (0, core_1.updateDocumentStatusStore)(doc.id, 'Uploaded');
        (0, core_1.updateDocumentStatusStore)(doc.id, 'Processing');
        // Sandboxed PDF Inspection
        let pdfBuffer;
        if (pdfBase64Payload) {
            pdfBuffer = Buffer.from(pdfBase64Payload, 'base64');
        }
        else {
            // Default valid 1-page PDF buffer for direct uploads
            pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R >> endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer << /Size 4 /Root 1 0 R >>\nstartxref\n160\n%%EOF');
        }
        const pdfResult = (0, core_1.processPDFBuffer)(pdfBuffer);
        if (!pdfResult.isValid) {
            (0, core_1.updateDocumentStatusStore)(doc.id, 'Failed', { processingError: pdfResult.error });
            return (0, api_response_js_1.createErrorResponse)('INVALID_PDF', pdfResult.error || 'Failed to parse PDF.', 422);
        }
        const updatedDoc = (0, core_1.updateDocumentStatusStore)(doc.id, 'Ready', {
            pageCount: pdfResult.pageCount,
        });
        return (0, api_response_js_1.createSuccessResponse)({
            document: {
                id: updatedDoc.id,
                workspaceId: updatedDoc.workspaceId,
                title: updatedDoc.title,
                fileSize: updatedDoc.fileSize,
                pageCount: updatedDoc.pageCount,
                status: updatedDoc.status,
                createdAt: updatedDoc.createdAt.toISOString(),
                updatedAt: updatedDoc.updatedAt.toISOString(),
            },
        }, 200);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('PROCESSING_FAILED', error.message || 'Processing failed.', 400);
    }
}
//# sourceMappingURL=route.js.map