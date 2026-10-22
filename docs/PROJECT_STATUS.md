# Malume Photography — Project Status and Engineering Roadmap

**Review date:** 2026-10-22
**Repository:** `photography-platform`
**Branch / HEAD:** `fix/production-custom-domain-cors` / `bf0b30b34e17ccf75afbf0ce29372c83dd502fd9`
**Upstream:** `origin/fix/production-custom-domain-cors`; local branch is 9 commits ahead, 0 behind.
**Working tree at this payment-integrity task start:** 30 modified and 16 untracked paths, no staged paths. This task preserves all pre-existing work and changes only payment integrity implementation, its integration checks, CI opt-in markers, and directly related documentation.

This document is the current source of truth for implementation and verification status. “Locally verified” means a command was run in this checkout; it does not imply production verification. The deployment has not been accessed.

## Overall status

The platform is a functioning React/Vite and Express/TypeScript application with Knex/PostgreSQL, Redis sessions, Cloudinary, SMTP, and Daraja STK initiation. It is **not ready to claim full production readiness for automatic payment settlement**. Callback settlement deliberately fails closed because production has no independent verifier. Database migration 014 and its database-level concurrency behavior have not been run against a proven disposable PostgreSQL instance in this review. No backup/restore drill or live deployment checks are evidenced here.

The public invoice API now returns a limited projection (invoice number, public payment identifier, amount, status, and billed line items); it no longer returns customer contact details or M-Pesa references. This local correction is covered by a unit test. The remaining public payment identifier is needed by the current pay/status API; it is an internal UUID and must not be treated as authorization.

## Repository and history evidence

- The expected branch and HEAD from the review request matched at the start.
- The branch tracks `origin/fix/production-custom-domain-cors`, at 9 ahead / 0 behind based on local refs; no fetch was performed.
- The existing working tree contained the CSRF, upload, and payment-attempt work described in the inventory below. No branch switch, stage, commit, reset, stash, push, merge, or deployment was performed.
- Local Git history and branches were inspected. No connected issue or pull-request source was available in this review, so requirements below are recovered from the supplied task history, repository docs, code, and tests.

## Requirements and feature inventory

| Workstream | Status | Evidence and remaining gap |
|---|---|---|
| Portfolio CMS navigation and gallery management | Implemented; locally verified by existing tests/build if those commands pass below | `client/src/pages/PortfolioCmsPage.tsx`, `client/src/lib/galleryUploadQueue.ts`, `server/src/routes/portfolioRoutes.ts`; cover, reorder, caption/alt text, and gallery operations are present. Manual browser usability remains unverified. |
| Multi-file Cloudinary uploads, ordering, captions, alt text, fallbacks | Validation and direct dependency declaration implemented; runtime/workflow verification incomplete | Upload queue and direct XHR progress helper in `client/src/lib/xhrUpload.ts`; server validates JPEG/PNG/WebP content and caps 15 MiB, 12,000 px per side, 40 MP, one file/request. Sharp 0.35.3 is declared directly in `server/package.json` and the lock root. npm 10.9.2 passes `npm ls --package-lock-only --all`; CI and Docker use Node 22, but Render's Node version is unspecified. On Windows x64/Node 22.16.0, Node package resolution still hits `EPERM` on `C:\Users\NIMROD`; offline install lacks cached packages and registry fetches fail with `EACCES`. No clean install or Sharp native load/fixture decode completed; Docker/WSL Linux verification is unavailable. Workflow and database failure compensation tests are absent; see roadmap. |
| PDF invoice export and download authorization | Planned / absent on this branch | README and repository inspection confirm no PDF export endpoint or UI on this branch. Local history has other feature branches but no evidence authorizing importing that feature into this security task. |
| Production error sanitization and health endpoint | Implemented; unit-level coverage exists | `server/src/middleware/errorHandler.ts`, `server/src/services/healthService.ts`, `server/src/middleware/errorHandler.test.ts`. `/health` reports service health only and returns 503 on dependency failure; deployment uptime behavior not checked. |
| Session-bound CSRF and direct XHR upload | Implemented; locally testable | `server/src/services/sessionService.ts` issues 32-byte random tokens; `server/src/middleware/auth.ts` checks exact Origin and constant-time token comparison for unsafe methods; `client/src/lib/csrf.ts` keeps token in memory; `client/src/lib/xhrUpload.ts` attaches token and credentials. CSRF test builds a representative test app, not the complete production route composition. |
| CORS custom and Vercel domains | Implemented; not externally verified | `server/src/config/env.ts`, `server/src/app.ts`; exact validated allowlist, credentials, defaults for `https://malumeph.com` and `https://photography-platform-eta.vercel.app` in production. Render environment value and deployed preflight have not been checked. |
| Featured projects and Cloudinary custom-domain behavior | Implemented; partially verified | Portfolio APIs and responsive Cloudinary URL helpers exist. No production domain/browser or measured Core Web Vitals evidence. |
| Newsletter recipient handling and public form | Implemented; partial verification | `NEWSLETTER_NOTIFY_EMAIL` is explicit and validated when present; notification is skipped if SMTP or recipient missing. Subscriber persistence and notification are separate; no durable outbox/retry, confirmation consent flow, or deletion/retention policy is evidenced. `newsletterDelivery` tests cover skip/delivery behavior. |
| Payment-attempt persistence and duplicate STK prevention | Implemented locally; additional integration tests added; runtime unverified here | Migrations 014–017 preserve the attempt/audit ledger, split enum use across committed migration boundaries, and install a `dispatching` state in the active-attempt index. Reconciliation rejects that state while STK HTTP may be in flight. Financial-history migrations are forward-only. PostgreSQL/Redis integration tests now require explicit disposable-service opt-ins and clean up only invoice fixtures created by the suite. No local disposable services were available or verified here; Neon was not contacted. |
| Daraja sandbox and production separation | Guard implemented locally; external configuration unverified | Development/test default to sandbox. `DARAJA_PRODUCTION_INITIATION_ENABLED` defaults false; a disabled production request is rejected before reservation and before provider HTTP. Startup validation rejects missing production environment, invalid enum/flag values, contradictory config, and incomplete approved production config. Callback verifier is still `async () => null`; no real sandbox request was made. |
| CI, tests, docs, deployment config | Implemented; CI not run from this review | `.github/workflows/ci.yml` defines frontend lint/test/build and backend typecheck/test/migration/seed/build with PostgreSQL 16 and Redis 7 services. No remote CI result was consulted. Render and Vercel configs exist; Render build uses `npm install` rather than `npm ci`, and pre-deploy runs migrations and admin seeding on each deploy. |
| Backup/restore, public invoice minimization, callback integrity, regression gaps | Mixed | Public invoice minimization corrected in this review and unit-tested. Callback fail-closed behavior remains in place. No backup/restore guide/drill exists. Ordinary edits can no longer mutate payment status/reference; manual outcomes use a separate session-authenticated, evidence-required, append-only audited operation. |
| Responsive UX, accessibility, SEO | Partially implemented / unmeasured | Semantic forms, labels, reduced-motion hooks and image alt-text fields exist. No browser E2E or accessibility audit evidence. `client/index.html` has basic title/description/Open Graph metadata; no canonical URL, sitemap, robots policy, or structured data is present. |

## Security and reliability findings

### OWASP alignment

- The synchronizer token is generated with cryptographic randomness, stored in the session, returned through no-store auth JSON, and compared with `timingSafeEqual`; exact Origin checks reject missing, `null`, malformed and unapproved values for protected mutations. This matches the core guidance in the [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Route-composition tests remain incomplete.
- Upload validation checks allowed MIME declarations and byte limits, but not file signatures or decoded content. OWASP's [File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) recommends defense in depth, including signature validation alongside content-type checks.
- Production error handling avoids returning internal stack/error details. Continue ensuring logs exclude database URLs, access tokens, session identifiers, payment payloads and unnecessary PII, consistent with the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

| Priority | Finding and evidence | Risk / current treatment |
|---|---|---|
| P0 — addressed locally, verify before release | `DARAJA_ENV=production` selects the live host. The new server-side `DARAJA_PRODUCTION_INITIATION_ENABLED` guard defaults false and runs before reservation and HTTP. | Automated tests show denied requests create no attempt and make no request. Keep the flag false; hosted configuration was not inspected. Do not activate until the verifier and reconciliation controls are approved. |
| P0 before automatic settlement | Daraja webhook is not independently verified: `server/src/services/invoiceService.ts` configures `verifyPayment: async () => null`. | Safe fail-closed state: callback payload cannot settle or fail invoices. Keep automatic settlement disabled until a provider-supported verifier and integration tests are available. |
| P1 | PostgreSQL payment integration suite is added but has not run in this checkout. | CI's local PostgreSQL service is explicitly selected and migrated before `npm test`; the deployment owner must review CI result and migration history before release. No Neon access or local DB verification occurred here. |
| P1 | Manual reconciliation is an operational API, not a complete in-app workflow or provider verifier. | Session-authenticated history and reconciliation endpoints require an attempt, reason and evidence reference; they record immutable actor/state audit events. Define evidence handling, operator roles, training, and a user interface before routine operational use. |
| P1 — addressed locally, verify in PostgreSQL | An ambiguous provider outcome or checkout-ID persistence failure can leave an active attempt. | The service durably changes `initiating` to `dispatching` before STK HTTP. Reconciliation cannot resolve `dispatching`; all uncertain outcomes remain active and retries reuse the attempt. A known pre-STK OAuth authentication failure can release it. No provider lookup mechanism is invented. The in-flight race regression test is in the disposable integration suite, which remains unrun here. |
| P1 | Render pre-deploy runs migrations and `seed:admin` on each deploy (`render.yaml`). | A configured seed password/hash can reset the admin password on every deploy. Verify intended deployment secret and command behavior; consider separating one-time provisioning from routine deploy after an operational decision. |
| P1 | No backup/restore procedures or successful restore evidence found. | Database loss or corruption recovery is unknown. Establish managed PostgreSQL backup policy and test restore to a separate database. |
| P2 | Current upload validation uses Sharp to inspect the actual container format, compare it with the declared MIME type, enforce dimensions/pixel/animation limits, and decode the image before Cloudinary upload. | This closes the previously reported MIME-only gap. Sharp's native runtime still needs clean-install and supported Linux verification (tracked under P1); no separate malware-scanning workflow is present. |
| P2 | Public APIs for bookings/quotes accept personal data and admin list endpoints return it. | This is expected for inquiry handling but retention, access review, privacy notice, deletion, and breach response procedures are not documented. |
| P2 | Newsletter signup sends notification asynchronously after storage; SMTP failure handling lacks a durable outbox/retry. | Subscriber is stored and the public success response is returned even if staff notification later fails. Consider an idempotent outbox and operational retry. |
| P2 | Browser-level critical-path, accessibility, and actual-origin tests are absent. | Build/unit checks cannot catch browser cookie, upload, mobile layout, keyboard, and deployment CORS regressions. |
| P3 | Render uses floating `npm install`, and dependency vulnerability status was not checked because no safe authoritative audit result was available locally. | Reproducibility/supply-chain drift; use lockfile-backed clean installs for deployment and schedule reviewed dependency audits. |

### Route protection summary

The production routers mount under `server/src/app.ts`. Every admin state-changing route below places `requireAdminSession` before its handler; that middleware enforces allowed Origin plus the session CSRF token for POST/PATCH/DELETE. Login has allowed-Origin validation. Public forms and Daraja webhook are intentionally outside admin CSRF.

| Methods and route patterns | Classification | Enforcement evidence |
|---|---|---|
| POST `/auth/login` | Authentication | `authRoutes.ts`: `requireAllowedOrigin`, login rate limit, schema validation. |
| GET `/auth/me` | Safe session restoration | `authRoutes.ts`; no mutation, response is no-store. |
| POST `/auth/logout` | Protected admin mutation | `authRoutes.ts`: `requireAdminSession`. |
| GET `/admin/bookings`, `/admin/calendar-blocks`; PATCH `/admin/bookings/:id`, `/admin/bookings/:id/status`; POST `/admin/calendar-blocks`; DELETE `/admin/calendar-blocks/:id` | Protected admin | `bookingRoutes.ts`: `requireAdminSession`. |
| POST `/quotes`; GET `/admin/quotes`; PATCH `/admin/quotes/:id`, `/admin/quotes/:id/status` | Public submission / protected admin reads and writes | `quoteRoutes.ts`. |
| GET `/admin/invoices`; POST `/admin/invoices`; PATCH/DELETE `/admin/invoices/:id` | Protected admin | `invoiceRoutes.ts`. |
| GET `/admin/invoices/:id/payment-history`; POST `/admin/invoices/:id/reconcile` | Protected admin history and manual reconciliation API | `invoiceRoutes.ts`; requires admin session, allowed Origin and session CSRF for reconciliation. Manual outcomes are audited but are not provider verified; `dispatching` attempts are quarantined. Operator policy/evidence standards and admin UI remain undecided. |
| GET `/invoices/:invoiceNo`; POST `/invoices/:id/pay`; GET `/invoices/:id/status` | Public invoice/payment | `invoiceRoutes.ts`; rate limit on lookup/pay. Response minimization is applied to lookup/status. UUIDs are identifiers, not authorization. |
| POST `/webhooks/daraja` | Provider webhook, no admin CSRF | `invoiceRoutes.ts`; callback verifier currently fails closed. |
| GET portfolio and photos; GET `/portfolio/admin`; POST/PATCH/DELETE categories, projects, photos, uploads and reordering | Public reads / protected admin | `portfolioRoutes.ts`; every mutation and admin list uses `requireAdminSession`. |
| GET `/events`; GET `/admin/public-events`; POST/PATCH/DELETE `/admin/public-events...`; POST upload | Public reads / protected admin | `publicEventRoutes.ts`. |
| POST `/newsletter/subscribe`; GET admin subscribers; PATCH deactivate | Public submission / protected admin | `newsletterRoutes.ts`. |
| GET `/journal...`; admin GET/POST/PATCH/DELETE `/admin/journal...` | Public reads / protected admin | `journalRoutes.ts`. |
| GET `/stats`; GET `/admin/stats`; PATCH `/admin/stats/:id` | Public read / protected admin | `statsRoutes.ts`. |
| PATCH `/admin/account/password`, `/admin/account/email` | Protected sensitive mutation, additionally rate limited | `adminAccountRoutes.ts`. |

The route inventory was derived from current route files; the CSRF test constructs representative routes rather than mounting every production router, so complete route-composition regression coverage remains a roadmap item.

## Current payment lifecycle and limits

1. Public invoice lookup returns amount/status/line items plus the internal invoice UUID needed by current pay/status endpoints. Contact details and payment references are excluded.
2. Payment initiation validates the Daraja config before reserving an attempt. Production is blocked unless `NODE_ENV=production`, `DARAJA_ENV=production`, and the explicit approval flag is true; incomplete sandbox config is also blocked before reservation.
3. After the guard, payment start locks the invoice, rejects paid invoices, returns the current active attempt, or reserves one. It then atomically transitions `initiating` to `dispatching` before calling Daraja. The partial unique index includes `dispatching`; provider HTTP remains outside the transaction. Reconciliation may not close `dispatching`, and if reconciliation resolves `initiating` first, the conditional transition prevents the provider request from being sent.
4. Only a definite OAuth authentication failure (before the STK request) marks the attempt failed. Timeout, STK rejection without a trusted definitive contract, non-2xx, malformed response, missing checkout ID, and checkout-ID persistence failure remain `dispatching` and block another prompt. Recovery for an uncertain outcome requires an independent trusted process and manual evidence; there is no implemented Daraja lookup/cancellation capability.
5. Callback checkout ID is mapped to an attempt, but current production verifier always returns null. The callback is acknowledged without invoice mutation or payment notification. Processor tests inject a fake verifier to exercise intended future persistence behavior; they do not establish a production verifier.
6. Existing `mpesa_ref` values are backfilled as `legacy_unverified`, because their historical meaning may be checkout ID or receipt. They block new prompts pending reconciliation.
7. Ordinary admin PATCH cannot change status/reference; after any attempt/evidence, it also freezes amount, invoice number, and billed line items. Customer contact details can still be corrected. Admin payment history and reconciliation are separate authenticated endpoints; reconciliation requires an eligible attempt, a session-derived actor, reason, and evidence reference. Manual reconciliation is audited but is not provider verification, and no in-app reconciliation screen or approved operator evidence standard exists.

Migrations 014–017 are forward-only because attempts, receipts, and reconciliation audit are financial evidence. Their `down` functions fail before dropping/loosening schema, even for apparently empty tables. PostgreSQL cannot safely remove used enum labels. Recover via an approved isolated backup restore or a reviewed forward migration; verify deployed migration history with the owner before release. Fresh-schema, supported-upgrade, and populated/empty rollback execution remain blocked pending isolated PostgreSQL validation.

Keep `DARAJA_PRODUCTION_INITIATION_ENABLED=false`. Do not activate live initiation or advertise automatic settlement until Safaricom-supported verification, amount/receipt/invoice binding, uniqueness, concurrency handling, notification idempotency, sandbox integration evidence, and production operational controls have been reviewed.

## Verification guide

### Local commands

Run from the relevant package directory:

```powershell
cd client
npm test
npm run lint
npm run build

cd ..\server
npm test
npm run typecheck
npm run build
```

These commands use checked-in dependencies and are offline with respect to payment, email, Cloudinary, and remote database services. `npm run migrate`, `npm run migrate:rollback`, and `npm run seed:admin` mutate data: run only against a disposable, identified local PostgreSQL database. The repository `server/.env` currently targets remote Neon; never run Knex commands with that configuration. This review did not contact it.

### PostgreSQL validation prerequisite

The GitHub Actions workflow creates a disposable PostgreSQL 16 database named `photography_platform_test` and Redis 7 for CI. The payment integration suite requires explicit disposable-database and disposable-Redis opt-in markers, local endpoints, and a database-identity check before writes; it cleans only invoice fixtures it creates. This checkout did not run the suite: prior verification recorded an unusable local PostgreSQL 18 service and unavailable Docker. No database was queried or changed for this task. The suite now includes the dispatch/reconciliation race, retry blocking, provider-response/persistence failures, invoice-detail freezing, actual route authorization, and forward-only rollback guards. Migration execution, fresh/upgrade paths, rollback behavior, and the CI result remain unverified. Never use `server/.env` as-is.

### Local verification performed on 2026-10-22

| Check | Result |
|---|---|
| Server built-in tests, including CORS, CSRF, errors, Daraja config boundary, image upload validation, payment coordinator/callback, newsletter, portfolio and public invoice projection | Earlier snapshot reported PASS — 70 tests, 0 failures. The most recent recorded attempt before this task failed during Node/tsx startup: all 10 files hit `EPERM` resolving `C:\Users\NIMROD`; assertions did not run. New payment race, route, migration rollback, and invoice-history regression tests have not run. |
| Server TypeScript typecheck | Attempted; exit 1 before TypeScript started because Node could not resolve the package path (`EPERM`, `lstat C:\Users\NIMROD`). |
| Server TypeScript build | Attempted; exit 1 before TypeScript started for the same Node package-resolution error. |
| Client built-in tests | Previously reported PASS — 18 tests, 0 failures; not rerun against the current uncommitted tree. |
| Client ESLint | Previously reported PASS; not rerun against the current uncommitted tree. |
| Client TypeScript build and Vite production build | Previously reported PASS with a generated chunk over 500 kB; not rerun against the current uncommitted tree. |
| Server lockfile validation | PASS — npm 10.9.2 `npm ls --package-lock-only sharp --depth=0` and `npm ls --package-lock-only --all` both exited 0. |
| Clean install and Sharp runtime | BLOCKED — isolated offline `npm ci` lacked cached `zod` (`ENOTCACHED`); registry requests failed with `EACCES`. Windows Sharp import failed at Node package resolution. No Linux/container environment was available. |
| `git diff --check` | PASS for this task; existing line-ending warnings only. |
| Knex migration / PostgreSQL concurrency / route authorization integration | NOT RUN — this task had no verified disposable PostgreSQL+Redis pair; project `.env` is remote Neon and was not contacted. |
| CI, Daraja sandbox, browser, staging/production deployment, backup/restore | NOT RUN. |

### Manual browser checks (not performed)

- Login, refresh/session restore, logout and token invalidation on both custom and Vercel origins.
- Verify credentialed CORS preflight includes `X-CSRF-Token`; approved origin succeeds and a disallowed origin cannot perform admin mutations.
- Admin create/edit/cancel project, ordering, captions/alt text, image upload progress/errors/cancel, invoice editing, and mobile keyboard navigation.
- Public invoice lookup, no-store responses, M-Pesa attempt uncertainty messaging, and status polling.
- Check DevTools for console/API errors, image selection/transfer sizes, and browser accessibility tooling.

## Deployment and environment guide

Actual checked-in deployment files are `vercel.json` and `render.yaml`; the backend is Render (`rootDir: server`), the frontend is Vercel, database is PostgreSQL, and Redis is configured by URL. Do not follow old Railway instructions elsewhere in the repository.

Backend variables are parsed in `server/src/config/env.ts`: `NODE_ENV`, `PORT`, `CLIENT_ORIGIN`, `DATABASE_URL`, `REDIS_URL`, `SESSION_COOKIE_NAME`, `SESSION_SECRET`, `COOKIE_SECURE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`, Cloudinary variables, SMTP variables plus explicit `NEWSLETTER_NOTIFY_EMAIL`, Gmail variables, WhatsApp provider/session path, and Daraja variables. Development/test default to sandbox; production must explicitly set `DARAJA_ENV`. `DARAJA_PRODUCTION_INITIATION_ENABLED` defaults false; true is accepted only with production environment, live Daraja environment, complete credentials, and an HTTPS callback. The server-side guard blocks initiation before attempt creation unless these checks pass. `EMAIL_PROVIDER=resend` currently selects a stub that is not configured; it is not a working Resend integration. Client `VITE_API_BASE_URL` is a build-time setting. Keep all values secret in deployment-managed configuration; never copy secrets into docs or issue output.

Render currently uses Node and `npm install && npm run build`, with pre-deploy migrations plus admin seed and start via `npm run start:render` (which runs migrations again through `npm start`). Review duplicate migration invocation and seed semantics with the deploy owner before changing. Its health path is `/health`. Vercel runs Vite build and SPA rewrites. Required production origins in Render `CLIENT_ORIGIN` are exact comma-separated values: `https://malumeph.com,https://photography-platform-eta.vercel.app`. Production cookie requires HTTPS and `COOKIE_SECURE=true`; frontend API URL should point to the Render service.

Cloudinary requires cloud name/API key/API secret. Newsletter signup alerts require SMTP host/user/password and an explicitly chosen `NEWSLETTER_NOTIFY_EMAIL`. Gmail notification provider requires Gmail user/app password; Resend and Meta WhatsApp adapters are stubs. Daraja sandbox uses the Safaricom sandbox host when `DARAJA_ENV=sandbox`; no live request was made. Real settlement is disabled until independent verification exists.

## Production readiness checklist

- [ ] Run CI on the reviewed commit and retain its result.
- [ ] Verify Render/Vercel environment names and exact origins without exposing values; test deployed preflight and session cookie behavior in a browser.
- [ ] Run the new disposable PostgreSQL payment integrity suite in CI and review the migration 015 result; hosted migration history remains unverified.
- [ ] Implement and independently review a provider-supported Daraja verification flow; prove unverified callbacks cannot change state and verified callbacks are idempotent.
- [ ] Define reconciliation evidence policy and operator roles, and decide whether an admin UI is required. The API and append-only audit are implemented; callback settlement and notification idempotency remain disabled.
- [ ] Confirm hosted Daraja variables are `DARAJA_ENV=sandbox` and `DARAJA_PRODUCTION_INITIATION_ENABLED=false`; verify without printing secrets. Test mocked sandbox behavior and, separately, authorized sandbox only. Keep the live initiation flag gated.
- [ ] Verify backup policy, retention, point-in-time recovery, and a restore drill to a separate database.
- [ ] Confirm admin seed behavior and credential rotation on Render deploy; review migration/start sequencing.
- [ ] Validate Cloudinary image constraints, privacy/data retention, SMTP failure/retry behavior, and service alerts.
- [ ] Complete browser E2E, accessibility/mobile, SEO, and Core Web Vitals checks on staging/production.
- [ ] Review dependency audit output and deploy lockfile-based clean installs.

## Prioritized 2026 roadmap

| Priority | Recommendation; evidence and risk | Proposed delivery and acceptance | Effort / dependencies / test |
|---|---|---|---|
| P0 — implemented locally | Guard live STK initiation. `DARAJA_ENV=production` selects the live host. | `DARAJA_PRODUCTION_INITIATION_ENABLED=false` by default; server config rejects contradictions and the payment coordinator denies before reservation/provider HTTP. Confirm hosted value stays false; do not enable until all payment controls are approved. | S. Depends on owner approval for future activation. Mocked boundary tests verify denied requests make no HTTP call and sandbox remains functional. |
| P0 | Keep automatic payment settlement disabled. Current verifier returns null; switching it risks forged settlement. | Implement only a documented provider-supported verification path; bind verified checkout, invoice, amount, receipt and currency; no state change on unverifiable/mismatched payload; idempotent notifications. | L. Depends on Safaricom-supported capability and business credentials. Mocked provider contract tests plus sandbox evidence; independent security review. |
| P1 | Run and review PostgreSQL integration tests. CI has a disposable service and the suite now covers lock/FK behavior, concurrency, and audit immutability, but no run is evidenced here. | Require CI result; separately confirm deployed migration history and rollback plan with the deployment owner. | M. CI database and migration owner verification. |
| P1 | Operational reconciliation workflow. API history and audited reconciliation are implemented; there is no in-app operator screen or defined evidence-handling policy. | Define evidence criteria, roles, training, and whether a UI is required. Manual reconciliation does not imply Daraja verification. | M/L. Product/operations decision; route auth/CSRF tests and DB atomicity test in CI. |
| P1 | Backups and restore drills. No procedure or restore evidence found. | Document provider backup/PITR settings, RPO/RTO, and run restore to isolated DB; record owner and cadence. | M. Depends on chosen PostgreSQL plan/access. Repeatable restore checklist and verified app schema check. |
| P1 | Safer release pipeline. CI exists, but deployment uses `npm install`; Render seeds admin during deploy and starts with migrations again. | Lockfile-backed `npm ci`; review migration sequencing and seed semantics; require CI and staged smoke checks before production. | S/M. Depends on deploy owner approval. CI rejects lint/test/typecheck/build/migration regressions; verify non-production deploy. |
| P2 | Browser E2E on public inquiry, admin CMS/upload and invoice flows. Unit tests miss actual cookies, browser CORS and responsive behavior. | Add Playwright or equivalent only after choosing CI browser infrastructure; mock payment/email/media. | M. Depends on CI browser runtime. Critical flows pass on desktop/mobile viewport and negative CSRF case. |
| P1 — runtime and workflow verification | Verify the upload decoder and media workflows in a supported deployment environment. Sharp 0.35.3 is now a direct server runtime dependency with a lockfile root entry; `render.yaml` still leaves Node unpinned. Gallery/journal upload can leave Cloudinary orphans after DB failure; cover/event deletes have a provider/database ordering gap. Gallery files are sent concurrently; server has no upload concurrency cap or app-level upload timeout. | Verify hosted Node >=20.9 and Linux platform binaries with a clean install and native Sharp load. Add isolated create/replace/reorder/delete and Cloudinary/DB failure compensation tests; define bounded upload concurrency and benchmark on staging with representative existing images. | CI Node 22, Docker Node 22 Alpine, and current Node 22.16.0 satisfy Sharp's >=20.9 engine requirement. This run could not execute npm/Node package commands because of a filesystem permission error resolving the protected user-profile path. Clean install, typecheck, build, tests, Docker build, Render runtime, memory/load, Cloudinary, and database integration were not run. Do not claim production verification. |
| P2 | Privacy and retention. Public forms store contact details; no retention/deletion policy found. | Define notice, access/retention windows, deletion/export process, backups expiry, and incident owner. | M. Depends on business/legal decisions. Documented policy and tested authorized deletion workflow. |
| P2 | Email reliability. Newsletter notification runs inline with no durable queue/outbox. | Add idempotent outbox/retry/dead-letter visibility if staff notifications are operationally important. | M/L. Depends on Redis/Postgres worker operations. Simulate SMTP outage/retry and duplicate delivery. |
| P2 | Accessibility, SEO and performance. Basic metadata exists; canonical/sitemap/robots/schema and measurement are absent. | Add route-aware metadata/canonical/sitemap only once canonical domain policy is confirmed; run WCAG-focused keyboard/contrast audit and Lighthouse on representative image-heavy pages. | M. Depends on content/domain decisions. Automated accessibility checks plus manual keyboard/screen-reader and CWV report. |
| P2 | Observability and uptime. Health endpoint checks Postgres/Redis but no alert integration or request correlation is evidenced. | Add structured request IDs, error monitoring, uptime checks, actionable alerts, and redacted payment-attempt diagnostics. | M. Depends on chosen provider and privacy boundaries. Simulated DB/cache/provider failures produce actionable alerts without PII/secrets. |
| P3 | Dependency/supply-chain hygiene. Current deployment does not use clean lockfile install; vulnerability audit not run here. | Add scheduled reviewed `npm audit`/OSV or approved scanner, dependency update cadence, lockfile checks and provenance review. | S/M. Depends on security policy. CI reports actionable findings and fails only on agreed severity thresholds. |
| P3 | Maintainability/type safety. Current services centralize substantial invoice/payment logic; DTO projection added to reduce accidental public exposure. | Continue explicit public/admin DTOs, service boundaries, shared validation, typed API contracts. | M. No framework rewrite. Static typecheck and contract tests prevent private field leakage. |
