"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
async function GET() {
    return new Response(JSON.stringify({
        status: 'healthy',
        version: '1.0.0-rc.1',
        environment: process.env.NODE_ENV || 'development',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=route.js.map