import { runDatabaseMigrations, SupabaseStorageProvider } from '@doctrack/core';

export async function GET() {
  const checks = {
    database: true,
    storage: true,
    email: true,
    stripe: true,
  };

  try {
    const migrationCheck = runDatabaseMigrations();
    checks.database = migrationCheck.success;

    const storage = new SupabaseStorageProvider();
    await storage.createPresignedDownloadUrl('ready_check_test');
  } catch (err: unknown) {
    checks.storage = false;
  }

  const allReady = Object.values(checks).every(Boolean);

  return new Response(
    JSON.stringify({
      status: allReady ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    }),
    {
      status: allReady ? 200 : 503,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}
