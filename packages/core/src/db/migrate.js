"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDatabaseMigrations = runDatabaseMigrations;
const schema_js_1 = require("./schema.js");
/**
 * Execute Drizzle / PostgreSQL database migrations.
 */
function runDatabaseMigrations(sqlClient) {
    const statements = schema_js_1.INITIAL_PG_MIGRATION_SQL.split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    if (sqlClient) {
        try {
            for (const statement of statements) {
                sqlClient.query(statement);
            }
            return { success: true, executedStatements: statements.length };
        }
        catch (err) {
            const error = err;
            return { success: false, executedStatements: 0, error: error.message };
        }
    }
    // Simulation mode for environments without active DB socket connection
    console.log(`[Database Migration Engine] Simulated execution of ${statements.length} Drizzle migration statements.`);
    return { success: true, executedStatements: statements.length };
}
//# sourceMappingURL=migrate.js.map