# Malume Photography Platform

A photography business platform for Malume Photography. The app combines an editorial public website with an admin dashboard for portfolio management, bookings, quotes, invoices, newsletter subscribers, public events, Cloudinary uploads, and M-Pesa Daraja STK initiation. See [current status and production-readiness blockers](docs/PROJECT_STATUS.md); automatic payment settlement is deliberately disabled until independent provider verification is implemented.

## Current Features

- Editorial homepage with warm monochrome design, moving photography marquee, scroll progress, floating WhatsApp CTA, and refined micro-interactions.
- Dedicated About page for the Malume Photography brand story, philosophy, creative process, and service positioning.
- Journal landing page for editorial stories, photography notes, client stories, featured galleries, and behind-the-scenes content.
- Portfolio page powered by API data, category filtering, animated hover states, and keyboard-accessible lightbox.
- Public events page powered by API data with loading, error, and empty states.
- Book Me calendar flow with availability lookup, booking form, and animated booking confirmation.
- Request a Quote flow with multi-step inquiry form and clear studio copy.
- Public invoice lookup and payment routes, including `/pay-invoice` and `/invoice/:invoiceNo`.
- Daraja STK Push initiation with persisted payment attempts and status polling. Webhooks fail closed: they do not settle invoices until a trusted provider-verification flow is implemented.
- Newsletter subscription with duplicate-aware messaging, SMTP notification support, and admin subscriber management.
- Secure admin login with Redis-backed sessions and protected admin routes.
- Admin dashboard for bookings, calendar blocks, quotes, invoices, portfolio CMS, public events, stats, settings, and newsletter subscribers.
- Cloudinary image uploads for portfolio covers and galleries, journal covers, and public event images. The backend validates image bytes with Sharp and stores Cloudinary public IDs for asset management.
- PostgreSQL migrations through Knex, including schema guard checks on server startup.
- Kenya localization for KSh, +254 phone numbers, and DD/MM/YYYY-oriented UX.

## Technologies

- Frontend: React, Vite, TypeScript, TailwindCSS, React Router, TanStack Query.
- Motion and visuals: CSS transitions/animations, GSAP infrastructure, Three.js dependency, reduced-motion safeguards.
- Backend: Node.js, Express, TypeScript, Zod validation.
- Database: PostgreSQL with Knex migrations.
- Sessions: Redis-backed admin sessions.
- Media: Cloudinary.
- Payments: Safaricom M-Pesa Daraja STK Push.
- Notifications: newsletter signup alerts use SMTP; the separate Gmail notification provider is implemented. Resend and WhatsApp providers are currently stubs/no-ops.
- CI/CD: GitHub Actions runs frontend lint/tests/build and backend typecheck/tests/migrations/admin seed/build on Node 22.

The current checkout does **not** contain an invoice PDF export. A PDF feature exists on a separate local/remote feature branch, but it is not part of this branch; do not assume it is available in production.

## Project Structure

- `client/` - React/Vite frontend.
- `client/src/pages/` - public and admin route pages.
- `client/src/components/` - shared UI, layout, auth, motion, and experience components.
- `client/src/lib/api.ts` - typed frontend API client.
- `client/src/config/site.ts` - central brand, contact, social, locale, and business configuration.
- `server/` - Express/TypeScript backend.
- `server/src/controllers/` - request handlers.
- `server/src/services/` - business logic.
- `server/src/routes/` - API route definitions and validation wiring.
- `server/src/db/migrations/` - versioned Knex migrations.
- `server/src/config/` - environment, Redis, Cloudinary, Daraja, and related clients.
- `docs/` - setup, payment, image, and admin guides.
- `.github/workflows/` - CI checks.

## Journal Feature

The Journal is a public editorial landing page at `/journal`. Its purpose is to give Malume Photography a storytelling space beyond the portfolio: weddings, events, corporate stories, behind-the-scenes notes, photography tips, client stories, featured galleries, travel stories, and studio process posts.

Current implementation:

- Implemented as `client/src/pages/JournalPage.tsx` and `client/src/pages/JournalPostPage.tsx`.
- Registered as lazy-loaded routes in `client/src/routes/Routes.tsx`.
- Linked from the main navigation and footer.
- Fetches published journal posts from the backend API, supports category filtering, and renders a live article detail view.
- Designed with the existing warm editorial palette, typography, borders, hover states, and CTA language.
- Admin journal management lives in `client/src/pages/AdminJournalPage.tsx` with create/edit/publish/draft/delete flows and cover uploads.
- Public URL: `/journal`.
- Detail URL pattern: `/journal/:slug`.

## Local Development

Use Node.js 22 (the CI and backend container runtime). Install the frontend and backend dependencies independently with their checked-in lockfiles:

1. Install frontend dependencies:

   ```bash
   cd client
   npm ci
   ```

2. Install backend dependencies:

   ```bash
   cd server
   npm ci
   ```

3. Start local PostgreSQL and Redis.

4. Copy `server/.env.example` to `server/.env` and set local values for PostgreSQL and Redis. Add provider credentials only for integrations you intend to test locally.

   Never commit real credentials. Keep production secrets in the deployment dashboard.

5. Run migrations:

   ```bash
   cd server
   npm run migrate
   ```

6. Seed the admin user:

   ```bash
   cd server
   npm run seed:admin
   ```

   The seed script requires `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`; it creates or updates the admin password. Use local/test credentials only. Render's current pre-deploy command also runs this script, so keep the deployment's admin seed secret intentional and managed outside Git.

7. Start the backend:

   ```bash
   cd server
   npm run dev
   ```

8. Start the frontend:

   ```bash
   cd client
   npm run dev
   ```

9. Useful local URLs:

- Public site: `http://localhost:5173`
- About: `http://localhost:5173/about`
- Journal: `http://localhost:5173/journal`
- Portfolio: `http://localhost:5173/portfolio`
- Booking: `http://localhost:5173/book`
- Quote request: `http://localhost:5173/request-quote`
- Invoice payment: `http://localhost:5173/pay-invoice`
- Admin login: `http://localhost:5173/admin/login`
- Backend health: `http://localhost:4000/health`

## Verification Commands

Frontend:

```bash
cd client
npm test
npm run lint
npm run build
```

Backend:

```bash
cd server
npm run typecheck
npm test
npm run build
```

Database:

```bash
cd server
npm run migrate
```

`npm test` in each package runs that package's listed test files with Node's built-in test runner. The client tests use TypeScript stripping. Knex migration and seed commands mutate data: use only an explicitly verified disposable local/test database, never the configured remote Neon URL or a production database. CI defines PostgreSQL 16 and Redis 7 service containers and runs backend typecheck, tests, migrations, admin seeding, and build; a successful local unit suite does not prove PostgreSQL concurrency or deployment behavior.

## Deployment Notes

- Frontend: `vercel.json` configures Vite with `client/dist` output and SPA rewrites. Set `VITE_API_BASE_URL` to the API base URL when it is not the local default (`http://localhost:4000`).
- Backend: `render.yaml` configures the Render web service `photography-platform-backend` with `server/` as its root, Node runtime, automatic deploys, a `/health` check, and build/start commands. CI and Docker use Node 22, but Render does not explicitly pin a Node version; verify/pin a supported Node 22 patch before release. The blueprint runs migrations and `seed:admin` during pre-deploy, and `npm start` also runs migrations. Review that repeated migration invocation and the password-changing seed behavior with the deploy owner. This repository does not configure Railway as its deployment target.
- Database and cache: configure `DATABASE_URL` and `REDIS_URL` in the backend environment. The schema guard checks required tables at startup; Render's pre-deploy command applies migrations.
- Media: set Cloudinary credentials. Portfolio covers/galleries use `malume-photography/portfolio`, public event images use `/events`, and journal covers use `/journal`. The server accepts JPEG, PNG, and WebP uploads and enforces size, dimensions, and decoded-pixel limits; see [image upload operations](docs/admin-image-upload.md). Sharp 0.35.3 requires Node >=20.9.
- Notifications: newsletter signup emails require `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS`, plus an explicitly configured `NEWSLETTER_NOTIFY_EMAIL` recipient. `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM` control SMTP transport/sender details. With no recipient or complete SMTP configuration, subscriptions still save but the notification is skipped. The separate Gmail provider uses `GMAIL_USER` and `GMAIL_APP_PASSWORD`; Resend and WhatsApp implementations are stubs and do not deliver messages.
- Newsletter delivery reads the legacy SMTP variables above; `EMAIL_PROVIDER` / Gmail provider credentials are used by the separate provider-based notification service and are not substituted automatically for newsletter signup mail.
- Payments: `DARAJA_ENV=sandbox` selects the sandbox host; production initiation also requires `DARAJA_PRODUCTION_INITIATION_ENABLED=true`, which defaults to false and must remain disabled until separately approved. Set only sandbox credentials for development. The callback verifier fails closed, so callbacks cannot confirm or fail payments. See [Daraja safety and prerequisites](docs/DARAJA_SETUP.md); do not enable live initiation or claim automatic settlement.
- Security: configure a long random `SESSION_SECRET`, `COOKIE_SECURE=true`, HTTPS, exact `CLIENT_ORIGIN` entries, and deployment-managed secrets only. Do not test payments or migration commands against production without explicit operational approval.

### Admin CSRF protection

Admin sessions use an HTTP-only cookie. On login and authenticated `/auth/me` session restoration, the API returns a random synchronizer CSRF token in a `Cache-Control: no-store` JSON response. The client keeps that token in memory (not local storage) and sends it in `X-CSRF-Token` on unsafe API methods. Admin routes guarded by `requireAdminSession` require both that session-bound token and an exact `Origin` from the configured `CLIENT_ORIGIN` allowlist. Safe `GET`, `HEAD`, and `OPTIONS` methods do not require the token. CORS remains explicitly allowlisted and credentialed; it complements rather than replaces the token check.

Login is not yet an authenticated session mutation and uses an exact allowed-origin check plus the existing JSON/CORS request path; logout is protected by the active session's CSRF token. Public booking, quote, newsletter, and invoice-payment requests do not use an admin token. The Daraja callback remains outside admin session and CSRF middleware because it is a provider webhook; its callback authentication/verification must follow the Daraja integration requirements and is not replaced by browser CSRF protection. No additional environment variable is required. Run `npm test` from `server/` and `npm test` from `client/` for the CSRF and CORS regression tests. Verify login, session restoration, admin mutations and preflight in the deployed browser before relying on this protection in production; deployment verification has not been performed from this repository.

Daraja callbacks retain the provider acknowledgment response, but are not independently verified and therefore cannot change an invoice's paid or failed state or send a paid notification. Sandbox STK Push initiation is available when correctly configured; production initiation additionally requires `DARAJA_PRODUCTION_INITIATION_ENABLED=true` and remains disabled by default. Payment status remains unresolved until a trusted operational reconciliation process is available. The current integration does not contain the credentials or an established verification adapter needed for independent transaction verification. Do not mark an invoice paid from callback contents alone. Add and verify a provider-supported flow, including amount, receipt and invoice association checks, before enabling automatic settlement. The current admin PATCH is not an auditable reconciliation workflow; see [project status](docs/PROJECT_STATUS.md).

STK payment attempts are stored separately from invoices. A single unresolved attempt is allowed per invoice; repeated requests reuse it, and an uncertain initiation result remains blocked until an administrator reconciles it. Existing `mpesa_ref` values are retained as unverified legacy references because older records may contain either checkout IDs or receipts. Mark an invoice failed only after checking a trusted source; this closes its active attempt and allows a later attempt.

### Environment configuration

The backend validates its environment in `server/src/config/env.ts`; `server/.env.example` lists variable names and safe example values. It covers `NODE_ENV`/`PORT`, `CLIENT_ORIGIN`, `DATABASE_URL`/`REDIS_URL`, session cookie and secret settings, admin seed credentials, Cloudinary, SMTP/newsletter, Gmail/Resend, WhatsApp, and Daraja. `DARAJA_PRODUCTION_INITIATION_ENABLED` defaults to false. Newsletter notifications specifically need SMTP host/user/password and an operator-chosen `NEWSLETTER_NOTIFY_EMAIL`; no personal address is supplied as a default. Keep secrets in an untracked local `.env` or deployment secret store. `VITE_API_BASE_URL` is a frontend build-time setting, not a backend secret.

Render currently runs the admin seed on each pre-deploy, so the configured password/hash can update the admin credential on deploy. Verify the intended credential and review the deployment sequence; do not assume the seed is one-time.

### Image delivery

Original Cloudinary uploads are retained. Public portfolio, project gallery, journal-cover, and event images use Cloudinary delivery transformations with `f_auto,q_auto`, width limits, and responsive `srcset` candidates; Cloudinary negotiates a supported modern format (such as WebP/AVIF) per request. `sizes` describes the layout so browsers can select a suitable candidate. Non-Cloudinary hosted URLs and local homepage assets keep their existing format and URL. Public images below the fold are lazy-loaded; only selected visible hero/lead content gets eager/high priority. Gallery cards use smaller variants, while the lightbox requests a larger variant. The helper falls back to the original Cloudinary URL if a transformed request fails. No before/after production transfer-size or Core Web Vitals measurement has been made in this repository; verify selected format, candidate size, and transfer bytes in browser DevTools or Lighthouse on production/staging before claiming a measured gain.

## Production API CORS

The production frontend origins are `https://photography-platform-eta.vercel.app` and `https://malumeph.com`. Both use the backend API at `https://malume-photography.onrender.com`.

The backend reads the comma-separated `CLIENT_ORIGIN` environment variable. Entries are trimmed, empty entries are ignored, and each entry must be an exact HTTP(S) origin (scheme and hostname, plus port if applicable; no path or trailing slash). CORS compares the request origin against this explicit allowlist and keeps credential support enabled. Production defaults to the two listed production origins; non-production defaults only to `http://localhost:5173`.

For local development, the default `CLIENT_ORIGIN=http://localhost:5173` permits the Vite development server. If Vite is configured to use another local port or origin, add that exact origin to `CLIENT_ORIGIN` in the developer's untracked `server/.env`, separated from any other permitted origins with commas. Do not copy local development origins into production configuration.

### Render configuration and activation

In the Render dashboard, open the `photography-platform-backend` web service, go to **Environment**, and set `CLIENT_ORIGIN` to:

```text
https://photography-platform-eta.vercel.app,https://malumeph.com
```

Save the environment change. A change to this backend code requires a backend deployment; an environment-variable change requires the service to restart or redeploy before it takes effect. Neither action changes the frontend API URL or DNS.

### Verify CORS

Run these from a terminal with `curl` installed. An allowed request should return the same origin in `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`:

```bash
curl -i -H 'Origin: https://photography-platform-eta.vercel.app' https://malume-photography.onrender.com/portfolio
curl -i -H 'Origin: https://malumeph.com' https://malume-photography.onrender.com/portfolio
```

An unapproved origin may still receive a normal HTTP response, but it must not receive `Access-Control-Allow-Origin`:

```bash
curl -i -H 'Origin: https://unapproved.example' https://malume-photography.onrender.com/portfolio
```

Inspect browser preflight behavior with an OPTIONS request. It should return the approved origin, credentials, and the requested permitted method/headers; repeat with the unapproved origin and confirm it receives no `Access-Control-Allow-Origin`:

```bash
curl -i -X OPTIONS https://malume-photography.onrender.com/portfolio \
   -H 'Origin: https://malumeph.com' \
   -H 'Access-Control-Request-Method: POST' \
   -H 'Access-Control-Request-Headers: content-type,authorization'
```

`curl` displays server headers but does not enforce browser CORS rules. Confirm the actual frontend request in browser developer tools as well. If the allowed origin is missing or mismatched, verify the Render `CLIENT_ORIGIN` value and that the backend has restarted/deployed. A matching CORS header with an HTTP error points instead to an API/application failure; a successful API response with empty lists may indicate missing database content. Broken or missing image URLs are a separate Cloudinary/media issue. Production origins must be explicitly allowlisted: never use wildcard origins, particularly with credentialed requests.

## Recent Production Improvements

- Added dedicated About and Journal pages.
- Corrected About and Journal navigation so they no longer point to unrelated routes.
- Updated WhatsApp, TikTok, LinkedIn, and business phone details centrally.
- Improved footer quick-link interactions and contact-link affordances.
- Refined quote-flow copy and pricing ranges.
- Added public invoice routes and Daraja troubleshooting logs.
- Added platform guides for Daraja testing and admin invoice workflows.
- Removed sensitive backend auth/session debug logs.

## Setup Guides

- `docs/CLOUDINARY_SETUP.md`
- `docs/admin-image-upload.md`
- `docs/DARAJA_SETUP.md`
- `docs/TESTING_DARAJA.md`
- `docs/ADMIN_INVOICE_GUIDE.md`
- `docs/PROJECT_STATUS.md` — audited implementation inventory, verification boundaries, security findings, setup/release guide and prioritized roadmap.
- `docs/ADDING_IMAGES.md`
- `docs/JOURNAL_GUIDE.md`
- `PROJECT_OVERVIEW.md`
