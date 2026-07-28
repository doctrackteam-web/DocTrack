"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const core_1 = require("@doctrack/core");
async function GET() {
    const checks = {
        database: true,
        storage: true,
        email: true,
        stripe: true,
    };
    try {
        const migrationCheck = (0, core_1.runDatabaseMigrations)();
        checks.database = migrationCheck.success;
        const r2 = new core_1.CloudflareR2StorageProvider();
        await r2.createPresignedDownloadUrl('ready_check_test');
    }
    catch (err) {
        checks.storage = false;
    }
    const allReady = Object.values(checks).every(Boolean);
    return new Response(JSON.stringify({
        status: allReady ? 'ready' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
    }), {
        status: allReady ? 200 : 503,
        headers: { 'Content-Type': 'application/json' },
    });
}
//# sourceMappingURL=route.js.map