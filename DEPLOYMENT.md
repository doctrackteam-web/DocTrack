# DEPLOYMENT RUNBOOK — DocTrack Inc. v1.0.0

---

## 📋 Infrastructure & Environment Setup

This runbook outlines the steps to deploy DocTrack to production using serverless edge infrastructure (Cloudflare Pages / Vercel + Supabase PostgreSQL & Supabase Storage + Resend + Stripe).

### Environment Configuration:

Ensure the following production environment variables are configured in your deployment platform:

```env
# Node Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.doctrack.com

# PostgreSQL & Supabase Connection String
DATABASE_URL=postgresql://doctrack_prod:SECURE_PASSWORD@ep-prod.us-east-1.aws.neon.tech/doctrack?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=doctrack-documents

# Resend Transactional Email API Key
RESEND_API_KEY=re_prod_secret_api_key_123456
EMAIL_FROM=DocTrack <notifications@doctrack.com>

# Stripe Credentials & Webhook Secret
BILLING_ENABLED=false
STRIPE_SECRET_KEY=sk_live_prod_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_prod_webhook_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_prod_stripe_key
```

### Deployment Pipeline Execution:

1. **TypeCheck & Validation**: `npm run typecheck`
2. **Execute Test Suite**: `npm test`
3. **Run Database Migrations**: `npm run db:migrate`
4. **Build Production Bundle**: `npm run build`
5. **Verify Health Endpoints**:
   - `GET /health` -> Expected 200 OK (`{"status": "healthy"}`)
   - `GET /ready` -> Expected 200 OK (`{"status": "ready"}`)
