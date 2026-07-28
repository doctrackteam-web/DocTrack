"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../../lib/api-response.js");
async function GET(request, { params }) {
    const sessionToken = params.token;
    if (!sessionToken) {
        return (0, api_response_js_1.createErrorResponse)('UNAUTHORIZED', 'Session token is required.', 401);
    }
    const sessionData = (0, core_1.validateSessionStore)(sessionToken);
    if (!sessionData) {
        return (0, api_response_js_1.createErrorResponse)('SESSION_EXPIRED', 'Viewer session has expired or is invalid.', 401);
    }
    // Sample valid PDF stream response with secure headers preventing hotlinking
    const samplePdfBytes = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n3 0 obj << /Type /Page /Parent 2 0 R >> endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\ntrailer << /Size 4 /Root 1 0 R >>\nstartxref\n160\n%%EOF');
    return new Response(samplePdfBytes, {
        status: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Cache-Control': 'private, no-store, no-cache, must-revalidate',
            'Content-Disposition': 'inline; filename="document.pdf"',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'SAMEORIGIN',
        },
    });
}
//# sourceMappingURL=route.js.map