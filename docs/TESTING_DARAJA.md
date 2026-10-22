# Testing Daraja STK Initiation

## What current tests establish

The repository tests exercise deterministic application logic with mocked provider results. `darajaSafety.test.ts` parses environment settings, passes them through the Daraja config and payment-attempt coordinator, and uses mocked HTTP to establish sandbox host selection and denial of unapproved production initiation before reservation or HTTP. The suite also covers attempt reservation policy and callback processor behavior when a verifier result is injected. Tests do not contact Safaricom, do not prove the production verifier works, and do not prove PostgreSQL row-lock concurrency.

For local development and CI, use `DARAJA_ENV=sandbox` and `DARAJA_PRODUCTION_INITIATION_ENABLED=false`. Production requires an explicit `DARAJA_ENV=production` and approval flag; do not set that flag or configure production credentials before verification and reconciliation requirements are completed. See [Daraja setup](DARAJA_SETUP.md).

In production code, callback verification currently returns `null`; therefore success and failure callback claims leave invoices unchanged. This is intentional fail-closed behavior. Do not use the sample callback payloads from older documentation or manually post a callback to mark an invoice paid.

## Run offline tests

```powershell
cd server
npm test
npm run typecheck
npm run build
```

Payment safety tests mock provider responses; they never contact Safaricom. No email, Cloudinary, or Redis is required. The PostgreSQL integrity suite runs only when explicitly pointed to a safe isolated database as described below; absent that opt-in it skips without connecting.

## Database tests

`invoicePaymentIntegrity.integration.test.ts` runs only when all safeguards are satisfied: `PAYMENT_TEST_DATABASE_URL` names `photography_platform_test` on `localhost` or `127.0.0.1` (port 5432 or the default), `REDIS_URL` names a local Redis service on `localhost` or `127.0.0.1` (port 6379 or the default), and both `PAYMENT_TEST_DATABASE_DISPOSABLE=1` and `PAYMENT_TEST_REDIS_DISPOSABLE=1` are set. Otherwise the suite is skipped without connecting. CI maps its disposable PostgreSQL 16 and Redis 7 services to localhost and sets these explicit opt-in values; it migrates the PostgreSQL service before running tests. The suite exercises actual FK deletion restrictions, invoice-row locking against deletion, active-attempt uniqueness via concurrent service calls, reconciliation audit immutability, and mocked sandbox provider requests. The current `server/.env` targets remote Neon and must never be used for these tests.

Do not run `npm run migrate`, `npm run migrate:rollback`, or `npm run seed:admin` until the connection target is proven disposable. See the database prerequisite in [project status](PROJECT_STATUS.md). Migration 015 down migration refuses when reconciliation history exists; PostgreSQL retains its new enum label after rollback. Hosted migration-history compatibility remains for the deployment owner to confirm. No database was contacted or mutated during this work.

## Authorized sandbox checks

Automated code changes should use mocked provider responses. Only use Safaricom sandbox credentials and test phone numbers for a separately approved sandbox smoke test; verify `DARAJA_ENV=sandbox` without printing secrets, and never reuse a production shortcode, credentials, or customer invoice. No sandbox request was made in this review.

Even a sandbox STK prompt does not verify callback authenticity or production settlement. Automatic settlement must remain disabled until the independent verification prerequisites in [Daraja setup](DARAJA_SETUP.md) are satisfied.
