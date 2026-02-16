# Go Canvas Deployment Security Checklist

## 1. Secrets and Environment

- Set `ENVIRONMENT=production`.
- Set a strong `SECRET_KEY` (minimum 32 random characters).
- Set `ALGORITHM` to `HS256`, `HS384`, or `HS512`.
- Set `DATABASE_URL` using TLS (include `sslmode=require`).
- Set production URLs:
  - `FRONTEND_URL=https://...`
  - `VITE_API_URL=https://...`
  - `EXPO_PUBLIC_API_URL=https://...`
- Set strict host controls:
  - `ALLOWED_HOSTS=api.example.com`
  - no `*`, no localhost values in production.
- Set strict CORS:
  - `CORS_ORIGINS=https://app.example.com,https://admin.example.com`
  - no `*`, no localhost values in production.
- Enable transport and headers:
  - `ENABLE_HTTPS_REDIRECT=true`
  - `SECURE_HEADERS=true`
- Configure Google OAuth:
  - `GOOGLE_CLIENT_ID=...`
- Configure SMTP if password reset email is required:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`.

## 2. Password Security Migration

- Run one-time migration for legacy plaintext passwords:
  - `npm run security:migrate-passwords`

## 3. Validate Before Deploy

- Run the strict predeploy validator:
  - `npm run predeploy:check`
- Or run manually with a specific env file:
  - `python scripts/predeploy_check.py --production --env-file .env.production`

## 4. CI and Verification

- Ensure CI workflow passes.
- Ensure `npm run check` passes.
- Verify login, signup, password reset, and Google onboarding in staging.

## 5. Post-Deploy

- Rotate any previously exposed credentials.
- Confirm HTTPS-only access at load balancer/proxy layer.
- Confirm no debug/test endpoints are public.
- Review logs for auth failures and suspicious traffic patterns.
