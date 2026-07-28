"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const security_1 = require("@doctrack/security");
const core_1 = require("@doctrack/core");
const api_response_js_1 = require("../../../../../lib/api-response.js");
async function POST(request) {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = (0, security_1.checkRateLimit)(`analytics:${ip}`, 100, 60000);
    if (!rateLimit.allowed) {
        return (0, api_response_js_1.createErrorResponse)('TOO_MANY_REQUESTS', 'Rate limit exceeded.', 429);
    }
    try {
        const { sessionId, documentId, linkId, workspaceId, eventType, pageNumber, durationMs, metadata, } = await request.json();
        if (!sessionId || !documentId || !linkId || !eventType) {
            return (0, api_response_js_1.createErrorResponse)('INVALID_PAYLOAD', 'sessionId, documentId, linkId, and eventType are required.', 400);
        }
        const event = (0, core_1.recordAnalyticsEventStore)(sessionId, documentId, linkId, workspaceId || 'default', eventType, pageNumber, durationMs, metadata);
        return (0, api_response_js_1.createSuccessResponse)({ eventId: event.id }, 201);
    }
    catch (err) {
        const error = err;
        return (0, api_response_js_1.createErrorResponse)('EVENT_RECORD_FAILED', error.message || 'Event recording failed.', 400);
    }
}
//# sourceMappingURL=route.js.map