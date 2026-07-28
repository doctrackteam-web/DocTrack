# VERCEL DEPLOYMENT RUNBOOK — DocTrack Inc. v1.0.0

---

## 🚀 Production Vercel Deployment Configuration

This guide details how to deploy the DocTrack v1.0.0 monorepo to **Vercel** with zero build errors.

### Project Build Settings:

- **Framework Preset**: `Other` (or `None`)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `apps/web/dist`
- **Node.js Version**: `18.x` or `20.x`

---

## 📋 Vercel CLI Deployment Runbook

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel Account
vercel login

# 3. Deploy to Staging Preview
vercel

# 4. Deploy to Production
vercel --prod
```
