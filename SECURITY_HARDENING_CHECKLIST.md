# SECURITY HARDENING CHECKLIST — DocTrack Inc. v1.0.0

---

## 🔒 Verified Hardening Checklist

- [x] **Authentication**:
  - [x] Passwords hashed using PBKDF2 with SHA-512 (100,000 iterations).
  - [x] Account lockout after 5 failed login attempts for 15 minutes.
  - [x] Session tokens hashed using SHA-256 before database storage.
  - [x] Session token rotated upon login.
  - [x] Password reset invalidates all active user sessions.
- [x] **API & Edge Security**:
  - [x] All errors formatted using RFC 7807 Problem Details JSON.
  - [x] Sliding-window rate limiters enabled across public endpoints.
  - [x] Direct storage bucket keys (Cloudflare R2) never exposed to client.
  - [x] PDF streaming returns `Cache-Control: private, no-store` and `X-Frame-Options: SAMEORIGIN`.
- [x] **Data & Signature Integrity**:
  - [x] Multi-signer audit trail enforces cryptographically linked SHA-256 hash chains (`evtsig_<id>`).
  - [x] Stripe webhooks verify `Stripe-Signature` header via HMAC SHA-256.
  - [x] Quotas enforced per subscription plan tier (`Free`, `Pro`, `Business`).
- [x] **Observability Security**:
  - [x] Structured JSON logger automatically redacts `password`, `token`, `secret`, and `signature` values.
