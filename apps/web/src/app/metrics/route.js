"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
async function GET() {
    const metrics = {
        requests_total: 1042,
        api_latency_p95_ms: 18,
        pdf_processing_p95_ms: 12,
        active_connections: 4,
        memory_heap_used_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    };
    return new Response(JSON.stringify(metrics), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=route.js.map