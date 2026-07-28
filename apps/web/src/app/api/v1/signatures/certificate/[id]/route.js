"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../../lib/api-response.js");
async function GET(request, { params }) {
    const certId = params.id;
    const cert = (0, core_1.getCompletionCertificateStore)(certId);
    if (!cert) {
        return (0, api_response_js_1.createErrorResponse)('NOT_FOUND', 'Completion certificate not found.', 404);
    }
    return (0, api_response_js_1.createSuccessResponse)({ certificate: cert }, 200);
}
//# sourceMappingURL=route.js.map