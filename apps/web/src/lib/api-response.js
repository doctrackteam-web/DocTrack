"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessResponse = createSuccessResponse;
exports.createErrorResponse = createErrorResponse;
function createSuccessResponse(data, status = 200, customHeaders) {
    const payload = {
        success: true,
        data,
        meta: {
            requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
            timestamp: new Date().toISOString(),
        },
    };
    const headers = new Headers({ 'Content-Type': 'application/json', ...customHeaders });
    return new Response(JSON.stringify(payload), {
        status,
        headers,
    });
}
function createErrorResponse(code, message, status = 400, details) {
    const payload = {
        success: false,
        error: {
            code,
            message,
            details,
        },
        meta: {
            requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
            timestamp: new Date().toISOString(),
        },
    };
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'Content-Type': 'application/problem+json' },
    });
}
//# sourceMappingURL=api-response.js.map