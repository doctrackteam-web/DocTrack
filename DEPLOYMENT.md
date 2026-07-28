# DEPLOYMENT RUNBOOK — DocTrack Inc. v1.0.0-RC-1

---

## 📋 Infrastructure & Environment Setup

This runbook outlines the steps to deploy DocTrack to production using serverless edge infrastructure (Cloudflare Pages / Vercel + Supabase/Neon PostgreSQL + Cloudflare R2 + Resend + Stripe).

### Environment Configuration:

Ensure the following production environment variables are configured in your deployment platform:

```env
# Node Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.doctrack.com

# PostgreSQL Connection String (Supabase / Neon)
DATABASE_URL=postgresql://doctrack_prod:SECURE_PASSWORD@ep-prod.us-east-1.aws.neon.tech/doctrack?sslmode=require

# Cloudflare R2 Credentials
R2_ACCOUNT_ID=8a4f9b0c1d2e3f4a5b6c7d8e9f0a1b2c
R2_ACCESS_KEY_ID=r2_access_key_production
R2_SECRET_ACCESS_KEY=r2_secret_key_production
R2_BUCKET_NAME=doctrack-prod-documents

# Resend Transactional Email API Key
RESEND_API_KEY=re_prod_secret_api_key_123456

# Stripe Credentials & Webhook Secret
STRIPE_SECRET_KEY=sk_live_prod_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_prod_webhook_secret_key
```

### Deployment Pipeline Execution:

1. **TypeCheck & Validation**: `npm run typecheck`
2. **Execute Test Suite**: `npm test`
3. **Run Database Migrations**: `npm run db:migrate`
4. **Build Production Bundle**: `npm run build`
5. **Verify Health Endpoints**:
   - `GET /health` -> Expected 200 OK (`{"status": "healthy"}`)
   - `GET /ready` -> Expected 200 OK (`{"status": "ready"}`)
