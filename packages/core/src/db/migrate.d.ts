export interface MigrationResult {
  success: boolean;
  executedStatements: number;
  error?: string;
}
/**
 * Execute Drizzle / PostgreSQL database migrations.
 */
export declare function runDatabaseMigrations(sqlClient?: {
  query: (sql: string) => Promise<unknown>;
}): MigrationResult;
//# sourceMappingURL=migrate.d.ts.map
