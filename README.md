# DocTrack Inc. — Commercial Enterprise Document Tracking & E-Signature Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/doctrack/doctrack)
[![Test Suite](https://img.shields.io/badge/tests-34%2F34%20passed-brightgreen.svg)](https://github.com/doctrack/doctrack)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/release-v1.0.0--RC1-orange.svg)](RELEASE_NOTES.md)

DocTrack is a secure, enterprise-grade document ingestion, analytics, tracking, edge viewer, and native electronic signature platform built with a high-performance modular monolith architecture.

---

## 🚀 Key Features

- **Identity & Authentication**: Account registration with default workspace auto-provisioning, PBKDF2 (SHA-512 100k) password hashing, rate limiting, and brute-force lockout.
- **Core Document Engine**: Storage abstraction (`IStorageProvider`) supporting Supabase Storage direct browser presigned uploads and sandboxed PDF header inspection (`%PDF-1.x`).
- **Secure Link Engine**: Password protection, custom slugs (`/v/:slug`), expiration dates, max view caps, and instant revocation.
- **Edge Document Viewer & Analytics**: Responsive viewer controller with zoom ($0.5\times \rightarrow 2.0\times$), page navigation, anti-hotlinking headers (`X-Frame-Options: SAMEORIGIN`), and real-time page reading duration analytics.
- **Organization & Global Search**: Nested folder hierarchy, soft delete/restore, global multi-entity search engine ($p95 < 3.5\text{ms}$), and dashboard metrics.
- **Native E-Signatures**: Multi-signer sequential signing workflows, field placement, secure signer session tokens, and cryptographic SHA-256 audit trail completion certificates (`cert_<id>`).
- **Enterprise Billing & Beta Mode**: Plan tiers (`Free`, `Pro`, `Business`), quota limit enforcement, Stripe checkout generator, and `BILLING_ENABLED=false` public beta mode.

---

## 🏛 Architecture

```text
[ Client / Browser ]
        │
        ▼ (HTTPS REST APIs)
[ apps/web ] ──► (Web Standard Handlers / Node Server)
        │
        ├──► [ packages/core ] ──► PostgreSQL (Drizzle ORM) + Supabase Storage
        ├──► [ packages/security ] ──► PBKDF2 / AES-256-GCM / Rate Limits
        └──► [ packages/contracts ] ──► Zod Schema DTO Contracts
```

---

## 🛠 Quickstart & Installation

```bash
# 1. Clone the repository
git clone https://github.com/doctrack/doctrack.git
cd doctrack

# 2. Install dependencies
npm install

# 3. Compile monorepo packages
npm run build

# 4. Execute test suite (34/34 passing)
npm test

# 5. Start development server
npm run dev
```

---

## 📋 Environment Configuration

Copy `.env.example` to `.env` and populate your credentials:

```bash
cp .env.example .env
```

Refer to [`ENVIRONMENT_SETUP.md`](ENVIRONMENT_SETUP.md) for full details.

---

## 🚀 Deployment

- Refer to [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md) for deploying to Vercel.
- Refer to [`DEPLOYMENT.md`](DEPLOYMENT.md) for production environment configuration.
- Refer to [`OPERATIONS.md`](OPERATIONS.md) for database backup and disaster recovery.

---

## 🛣 Roadmap & Version History

- **v1.0.0 (Current)**: Public Beta MVP release (Core Document Engine, Secure Sharing, Edge Viewer, Analytics, E-Signatures, Beta Billing Mode).
- **v1.1.0 (Upcoming)**: Team role permissions, custom branding, and Webhooks API.

---

## 📄 License & Contributing

Licensed under the [MIT License](LICENSE). Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
