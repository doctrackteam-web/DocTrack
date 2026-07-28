# OPERATIONAL RUNBOOK & DISASTER RECOVERY — DocTrack Inc.

---

## 🛠️ Operations & Maintenance Protocols

### 1. Database Backup & Disaster Recovery Procedure

- **Automated Point-In-Time Recovery (PITR)**: Managed PostgreSQL provider (Neon/Supabase) executes WAL archive backups every 5 minutes.
- **Manual Snapshot Command**:
  ```bash
  pg_dump --clean --if-exists --no-owner --no-privileges -h ep-prod.us-east-1.aws.neon.tech -U doctrack_prod -d doctrack > doctrack_backup_$(date +%Y%m%d_%H%M%S).sql
  ```
- **Disaster Recovery Checklist**:
  1. Spin up standby PostgreSQL instance.
  2. Restore SQL snapshot file: `psql -h <new_host> -U doctrack_prod -d doctrack < backup.sql`.
  3. Execute `npm run db:migrate` to verify schema version.
  4. Update `DATABASE_URL` secret and trigger application redeployment.

### 2. Operational Health Monitoring

- Ping `/health` every 30 seconds via Cloudflare Health Checks.
- Monitor `/metrics` for latency spikes ($p95 > 200\text{ms}$).
- Monitor Sentry dashboard for unhandled exceptions.
