/**
 * DocTrack Environment Validation Script
 * Verifies required environment variables exist before build/dev execution.
 */

const requiredVars = [
  'NODE_ENV',
  'SESSION_SECRET',
  'DATABASE_URL',
];

function validateEnv() {
  console.log('🔍 Validating environment variables...');
  const missing = [];

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  } else if (missing.length > 0) {
    console.warn(`⚠️ WARNING: Missing environment variables for local dev: ${missing.join(', ')}`);
  } else {
    console.log('✅ Environment variable check passed clean.');
  }
}

validateEnv();
