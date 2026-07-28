# DOCTRACK v1.0.0 — BETA TESTING & USER ONBOARDING KIT

---

## 🧪 1. Beta Testing Checklist

- [ ] **Account Registration & Security**:
  - [ ] Register new account at `/register` with valid email & password ($8+$ chars, uppercase, digit, symbol).
  - [ ] Verify auto-provisioned Default Workspace (`<Name>'s Workspace`).
  - [ ] Test login session persistence & password reset flow via transactional email.
- [ ] **Document Ingestion & Cloudflare R2 Upload**:
  - [ ] Upload PDF ($< 50\text{MB}$) via presigned Cloudflare R2 direct browser URL.
  - [ ] Verify sandboxed PDF magic byte inspection & page count extraction.
- [ ] **Secure Sharing Engine & Edge Viewer**:
  - [ ] Generate public and password-protected document links (`/v/:slug`).
  - [ ] Test link expiration dates, max view caps, and link revocation.
  - [ ] Open Edge Document Viewer, test zoom controls ($0.5\times \rightarrow 2.0\times$), page navigation, and keyboard shortcuts (`PageDown`/`PageUp`).
  - [ ] Verify real-time page duration & scroll depth analytics recorded in owner dashboard.
- [ ] **Organization & Search**:
  - [ ] Create nested folder hierarchy and move documents.
  - [ ] Execute global search (`/search?q=...`) across documents, folders, and links.
- [ ] **Native E-Signatures**:
  - [ ] Create multi-participant signature request with signature/initial/date fields.
  - [ ] Complete signing workflow as recipient, verify SHA-256 hash chain audit trail and completion certificate generation (`cert_<id>`).
- [ ] **Billing & Stripe Test Mode**:
  - [ ] Upgrade workspace to Pro or Business plan via Stripe Test Mode checkout.
  - [ ] Verify Stripe webhook signature validation (`checkout.session.completed`) and plan quota limit enforcement.

---

## 🐛 2. Bug Report Template

````markdown
### Bug Summary

[Short 1-line description of the bug]

### Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior

[Clear description of what should happen]

### Actual Behavior

[Clear description of what actually happened]

### Environment

- Browser & Version: [e.g. Chrome 124, Safari 17]
- OS: [e.g. macOS Sonoma, Windows 11, iOS 17]
- Account Tier: [Free / Pro / Business]

### Supporting Evidence / Error Payload

```json
{
  "code": "ERROR_CODE",
  "message": "Error details"
}
```
````

```

---

## 📋 3. User Feedback Form

1. **Time to First Value (TTFV)**: Were you able to upload a document and share a secure link in under 2 minutes? `[Yes / No]`
2. **Edge Viewer Experience**: How smooth was document rendering and page navigation on your browser? `[1 - 5 Stars]`
3. **E-Signature Workflow**: Did the signing process and completion certificate feel simple and intuitive for recipients? `[Feedback Text]`
4. **Feature Requests**: What feature would make DocTrack indispensable for your daily workflow? `[Feedback Text]`

---

## ⚠️ 4. Known Issues & Operational Limits (v1.0.0)

- **File Format Constraint**: Version 1.0.0 exclusively supports PDF (`application/pdf`) files up to 50 MB. Non-PDF files (DOCX, PPTX) will be supported in Version 2.
- **Argon2id Edge Constraint**: PBKDF2 with SHA-512 (100,000 iterations) via WebCrypto is enforced for 100% serverless edge runtime compatibility.
```
