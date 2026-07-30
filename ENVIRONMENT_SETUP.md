# ENVIRONMENT SETUP RUNBOOK — DocTrack Inc. v1.0.0

---

## 📋 Required Production Environment Variables

| Variable Name                        | Description                                            | Required / Optional | Example Value                                            | Provider         |
| :----------------------------------- | :----------------------------------------------------- | :------------------ | :------------------------------------------------------- | :--------------- |
| `NODE_ENV`                           | Application environment (`development` / `production`) | **Required**        | `production`                                             | Vercel / System  |
| `NEXT_PUBLIC_APP_URL`                | Base public URL for links & redirects                  | **Required**        | `https://app.doctrack.com`                               | Vercel / Domain  |
| `DATABASE_URL`                       | PostgreSQL connection URL                              | **Required**        | `postgresql://user:pass@ep.neon.tech/db?sslmode=require` | Supabase / Neon  |
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase project URL                                   | **Required**        | `https://xyz.supabase.co`                                | Supabase         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Supabase public anonymous API key                      | **Required**        | `eyJhbGciOi...`                                          | Supabase         |
| `SUPABASE_SERVICE_ROLE_KEY`          | Supabase administrative service role key               | **Required**        | `eyJhbGciOi...`                                          | Supabase         |
| `SUPABASE_STORAGE_BUCKET`            | Supabase Storage bucket for documents                  | **Required**        | `doctrack-documents`                                     | Supabase Storage |
| `RESEND_API_KEY`                     | Transactional email provider API key                   | **Required**        | `re_123456789`                                           | Resend           |
| `EMAIL_FROM`                         | Sender email address for notifications                 | **Required**        | `notifications@doctrack.com`                             | Resend           |
| `BILLING_ENABLED`                    | Feature flag for paid checkout enforcement             | **Required**        | `false` _(Set `true` post-beta)_                         | App Config       |
| `STRIPE_SECRET_KEY`                  | Stripe secret API key                                  | Optional in Beta    | `sk_live_12345...`                                       | Stripe           |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret                          | Optional in Beta    | `whsec_12345...`                                         | Stripe           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client publishable key                          | Optional in Beta    | `pk_live_12345...`                                       | Stripe           |
