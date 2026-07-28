# PENETRATION TESTING REPORT — DocTrack Inc.

**Stage**: Sprint 1F.0 Automated & Manual PenTest  
**Date**: July 28, 2026

---

## 1. Scenario 1: Cross-Tenant IDOR & Unauthorized Document Access

- **Target**: `GET /api/v1/documents/[id]` and `GET /api/v1/analytics/document/[id]`
- **Attack Payload**: Authenticated user $A$ attempts to access `document_id_B` owned by user $B$ in another workspace.
- **Result**: **SUCCESS (ATTACK BLOCKED)**. Returns `404 Not Found` RFC 7807 problem details response. Zero metadata or storage key leakage.

---

## 2. Scenario 2: XSS Injection in Document Titles & Viewer Canvas

- **Target**: `POST /api/v1/documents/upload` with title `<script>alert('xss')</script>` or `<img src=x onerror=alert(1)>`.
- **Result**: **SUCCESS (ATTACK BLOCKED)**. Input sanitized and rendered safely via text node binding. Content Security Policy (`CSP`) blocks inline script execution.

---

## 3. Scenario 3: Brute-Force Password Link Access & Rate Limit Bypass

- **Target**: `POST /api/v1/view/access` with 1,000 dictionary password attempts on protected slug `/v/private-doc`.
- **Result**: **SUCCESS (ATTACK BLOCKED)**. Request 31 triggered `429 Too Many Requests` RFC 7807 response. Further attempts blocked by sliding-window rate limiter.

---

## 4. Scenario 4: Stripe Webhook Forgery & Signature Spoofing

- **Target**: `POST /api/v1/billing/webhook` with unauthenticated checkout completion payload.
- **Result**: **SUCCESS (ATTACK BLOCKED)**. Rejected with `401 Unauthorized` (`INVALID_WEBHOOK_SIGNATURE`). HMAC SHA-256 validation prevents unauthorized plan upgrades.

---

## 5. Scenario 5: Malicious File Upload (Corrupted PDF & Zip Bombs)

- **Target**: Uploading non-PDF binary payload renamed to `contract.pdf`.
- **Result**: **SUCCESS (ATTACK BLOCKED)**. Sandboxed PDF processor (`processPDFBuffer`) detected header mismatch (`Magic header check failed`) and returned `422 Unprocessable Entity`.
