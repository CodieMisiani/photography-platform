# Photography Platform Overview

## Section A - Explain It Like I'm Five

This project is a website and control room for a photography studio.

A visitor can open the website, look at the studio's photography work, see public studio events, request a quote for a bigger creative idea, book a specific open date, and request an M-Pesa STK prompt for an invoice. Payment callbacks are not independently verified and do not settle invoices.

An admin can sign in to a private dashboard and manage the business: portfolio photos, client bookings, quote requests, invoices, payment status, blocked calendar dates, and public event listings.

Think of the system like a real studio:

- The frontend is the storefront. It is what visitors and admins see in the browser.
- The backend is the back office. It receives forms, checks login sessions, stores records, and talks to outside services.
- Postgres is the filing cabinet. It keeps bookings, quotes, invoices, events, and portfolio records.
- Redis is the wristband at the door. It remembers which admin is logged in for eight hours.
- Cloudinary is the photo shelf. It stores uploaded portfolio covers/galleries, journal covers, and public event images.
- SMTP email is the studio bell. It tells the admin when somebody joins the newsletter.
- Daraja sends the STK Push prompt. Callback payloads are acknowledged but are not trusted to confirm payment.

## Section B - Technical Setup & Handoff Doc

### Architecture

The browser runs the React/Vite frontend in `client`. React components call one typed API layer at `client/src/lib/api.ts`. That API layer calls the Express backend in `server`. Express validates requests with Zod, checks admin sessions with Redis, reads and writes Postgres through Knex, validates and uploads portfolio, journal, and public event images to Cloudinary, sends newsletter signup notifications through SMTP, and triggers M-Pesa STK Push through Safaricom Daraja.

The homepage image marquee reads from real local photography assets listed in `homeMarqueeImages` in `client/src/data/homeFixtures.ts`. The homepage duplicates that list automatically for the seamless loop.

Flow in words:

`React pages -> typed API client -> Express routes/controllers -> services -> Postgres/Redis/Cloudinary/Daraja`

### Brand Accent Color

- Brand Accent Color: `#0077B5` (Classic LinkedIn Blue).
- Defined in: `client/tailwind.config.ts` as the `accent` token, `client/src/styles/globals.css` as CSS variables, and `client/src/config/site.ts` in the `brand` block.
- Applied to: CTAs, nav active/hover states, admin sidebar active states, status badges for paid/confirmed/new states, stats count-up numbers, footer link/icon hovers, and input focus rings.
- Not applied to: page backgrounds, body typography, cards, destructive UI, the marquee, photography image treatments, or section layouts.
- WCAG AA compliant: confirmed for accent text on white, white text on accent, accent on dark ink, and accent text on muted accent badge backgrounds.
- Full design system guide: `docs/DESIGN_SYSTEM.md`.
- Brass/gold is intentionally not part of the live color system. Warmth comes from photography, paper surfaces, and ink surfaces.

### Environment Variables

These match `server/.env.example`.

- `NODE_ENV`: `development`, `test`, or `production`.
- `PORT`: Backend port, usually `4000` locally.
- `CLIENT_ORIGIN`: Frontend URL allowed by CORS, for example Vercel production URL.
- `DATABASE_URL`: PostgreSQL connection string from Neon.
- `REDIS_URL`: Redis connection string from Upstash.
- `SESSION_COOKIE_NAME`: Admin session cookie name.
- `SESSION_SECRET`: Long random secret for signed cookies.
- `COOKIE_SECURE`: `true` in production HTTPS, `false` locally.
- `ADMIN_EMAIL`: Placeholder variable name used by the admin seed script.
- `ADMIN_PASSWORD`: Placeholder variable name used by the admin seed script. Set the real value only in an untracked local env file or deployment secret manager.
- `ADMIN_PASSWORD_HASH`: Optional bcrypt hash fallback if no plain seed password is supplied.
- `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard.
- `CLOUDINARY_API_KEY`: From Cloudinary dashboard.
- `CLOUDINARY_API_SECRET`: From Cloudinary dashboard.
- `CLOUDINARY_FOLDER`: Root Cloudinary folder. Defaults to `malume-photography`; uploads are separated into `/portfolio`, `/events`, and `/journal`.
- `SMTP_HOST`: SMTP server host for newsletter signup notifications.
- `SMTP_PORT`: SMTP server port, usually `587` or `465`.
- `SMTP_USER`: SMTP username.
- `SMTP_PASS`: SMTP password or app password.
- `SMTP_FROM`: Sender address shown on newsletter notification emails.
- `SMTP_SECURE`: `true` for implicit TLS, usually port `465`; `false` for STARTTLS, usually port `587`.
- `NEWSLETTER_NOTIFY_EMAIL`: Optional recipient for new-subscriber notification emails; configure an inbox you control to enable delivery.
- `EMAIL_PROVIDER`: `gmail` or `resend` for the separate provider-based notification service; Resend is currently a stub. Newsletter signup mail uses the SMTP variables above independently.
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`: Credentials for the implemented Gmail notification provider.
- `WHATSAPP_PROVIDER`: `baileys` or `meta`; both provider transports currently skip delivery.
- `BAILEYS_SESSION_PATH`: Configured session path; a durable QR/session transport is not implemented.
- `DARAJA_ENV`: `sandbox` or `production`.
- `DARAJA_PRODUCTION_INITIATION_ENABLED`: Defaults to `false`; keep false until live initiation controls and provider verification are approved.
- `DARAJA_CONSUMER_KEY`: From Safaricom Daraja app.
- `DARAJA_CONSUMER_SECRET`: From Safaricom Daraja app.
- `DARAJA_PASSKEY`: Daraja STK Push passkey.
- `DARAJA_SHORTCODE`: Paybill/till shortcode.
- `DARAJA_CALLBACK_URL`: Public backend URL ending in `/webhooks/daraja`.

For the frontend, set `VITE_API_BASE_URL` to the backend URL.

### Environment Variables - Where To Get Each One

- Render service settings: `DATABASE_URL`, `PORT`.
- Upstash dashboard: `REDIS_URL`.
- Cloudinary dashboard: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- SMTP provider dashboard: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- Studio inbox owner: `NEWSLETTER_NOTIFY_EMAIL`.
- Safaricom Daraja developer portal: `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `DARAJA_PASSKEY`, `DARAJA_SHORTCODE`, `DARAJA_CALLBACK_URL`.
- Self-generated: `SESSION_SECRET` as a long random string, `SESSION_COOKIE_NAME`, and admin seed values used only outside git.
- Vercel project settings: `VITE_API_BASE_URL`, set to the Render backend URL.

### Local Setup

1. Install frontend dependencies with the checked-in lockfile:

   ```bash
   cd client
   npm ci
   ```

2. Install backend dependencies:

   ```bash
   cd server
   npm ci
   ```

3. Create `server/.env` from `server/.env.example` and fill real local or production PostgreSQL/Redis values.

   Point `DATABASE_URL` and `REDIS_URL` at disposable local/test services for development and tests; never use the configured remote Neon URL for routine migration checks. For image uploads, also fill the Cloudinary variables. Existing rows that do not have a stored Cloudinary public ID still render, but deletion is skipped because the app cannot safely guess an ID.

   For newsletter notifications, fill the SMTP variables. If SMTP is missing, subscriptions still save and the backend logs that the notification was skipped.

4. Run migrations:

   ```bash
   cd server
   npm run migrate
   ```

5. Seed the admin user:

   ```bash
   cd server
   npm run seed:admin
   ```

6. Start backend:

   ```bash
   cd server
   npm run dev
   ```

7. Start frontend:

   ```bash
   cd client
   npm run dev
   ```

8. Visit:
   - Public site: `http://localhost:5173`
   - Booking flow: `http://localhost:5173/book`
   - Admin login: `http://localhost:5173/admin/login`
   - API health: `http://localhost:4000/health`

### Test And CI Commands

Current local verification commands:

```bash
cd client
npm test
npm run lint
npm run build
```

```bash
cd server
npm test
npm run typecheck
npm run build
```

Run `npm run migrate` separately and only after verifying that `DATABASE_URL` points to an explicitly disposable local/test database. It changes schema and data; never use the configured remote Neon URL for routine validation.

GitHub Actions are configured in `.github/workflows/ci.yml`. The current CI workflow runs frontend lint, Node tests, and build; backend typecheck, Node tests, migrations, admin seeding, and build against disposable PostgreSQL/Redis services. The project uses Node's built-in test runner; no browser E2E suite is currently configured. See [the audited project status](docs/PROJECT_STATUS.md) for exact verification boundaries and blockers.

### Deployment Topology

Current repository deployment configuration:

- Frontend: Vercel (`vercel.json`).
- Backend API: Render (`render.yaml`).
- Runtime: CI and Docker use Node 22; `render.yaml` does not pin Node. Select a supported Node 22 patch in Render before release and verify the deployed version.
- PostgreSQL: configured through Render's `DATABASE_URL` environment setting.
- Redis: configured through `REDIS_URL` (Upstash is supported but not required by repository code).
- Media: Cloudinary.
- Payments: Safaricom Daraja.

To deploy:

1. Configure the Render backend and required services/environment values.
2. Render's current blueprint applies migrations and seeds the admin during pre-deploy; set intentional admin seed secrets in Render because the seed updates an existing admin password.
3. Deploy the frontend from `client` to Vercel and set `VITE_API_BASE_URL` to the Render backend URL.
4. Set Daraja callback URL to the public backend URL ending in `/webhooks/daraja`.
5. Confirm `/health` returns sanitized Postgres and Redis status.
6. Test admin login, booking creation, quote submission, invoice creation, and M-Pesa sandbox STK initiation using non-production data. Keep `DARAJA_ENV=sandbox` and `DARAJA_PRODUCTION_INITIATION_ENABLED=false`; automatic callback settlement is disabled pending trusted verification.

Rollback:

- Vercel: promote a previous deployment.
- Render: redeploy a previous successful build after checking migration compatibility.
- Database: no restore drill is evidenced. Establish a managed backup policy and verify restore to a separate database before relying on recovery.

### What's Finished

- React/Vite/Tailwind frontend with the existing monochrome editorial design preserved.
- Homepage refinement with clean hero, CSS-only text reveal, left-to-right moving image marquee, and extra spacing between hero copy and the image reel.
- Homepage-aware transparent header at the top of the dark hero with the existing scrolled header state preserved.
- Scroll-to-top navigation for in-app route changes, with reduced-motion support and native browser back/forward scroll restoration preserved.
- Mobile hamburger menu with keyboard/focus handling.
- Admin panel mobile hamburger navigation, sharing the public menu's focus trap, route-close, Escape close, outside-click close, active state, and breakpoint behavior.
- Hero section staggered fade-up entrance animation, viewport-triggered and `prefers-reduced-motion` safe.
- Stats section staggered card entrance with deferred count-up trigger.
- Public portfolio reads from the API.
- Public events reads from the API.
- Quote request form submits to `/quotes`.
- Book Me flow has a separate calendar and booking form that submits to `/bookings`.
- Express/TypeScript backend structure with controllers, services, routes, middleware, config, db, and types.
- Postgres migrations for required business tables plus `admin_users`.
- Redis-backed admin sessions.
- DB-backed admin login seed flow.
- Protected admin routes.
- Portfolio CMS create/delete/feature and Cloudinary upload path.
- Portfolio and public event image uploads store Cloudinary public IDs and clean up old Cloudinary assets on replacement/delete when a public ID exists.
- Portfolio CMS full inline editing for title, category, event date, cover URL/upload, and featured state.
- Booking admin page with full booking editing, booking status changes, and date block/unblock.
- Quote inbox with status changes and internal notes.
- Invoice admin create/edit/delete with multiple line items and computed totals.
- Public invoice lookup shows itemized line items.
- Public events admin create/edit/delete/publish toggle with image URL/upload support.
- Public events render real uploaded event images when present.
- Public and admin journal pages now render live journal posts, including detail routes and Markdown-based editing with publish/draft controls.
- Portfolio project galleries use `project_photos`, with ordered Cloudinary-backed images and admin upload, caption, delete, and reorder controls.
- Journal posts use `journal_posts`, with published-only public APIs and session-protected admin CRUD.
- Footer social links use the configured TikTok, WhatsApp, X, Facebook, and LinkedIn URLs.
- Newsletter subscription is backed by `newsletter_subscribers`, a public subscribe endpoint, admin subscriber list with soft deactivate, duplicate-aware visitor messaging, and SMTP notification emails to the configured admin inbox.
- Footer privacy/terms links resolve to real routes.
- Navbar hover uses a center-morph underline and subtle letter-spacing transition with reduced-motion support.
- Warm editorial visual system with two-color discipline, warmer paper/ink tokens, Cormorant Garamond display typography, richer public/admin surface states, and improved focus treatment.
- Brass accent removed from live UI tokens and replaced with neutral semantic text hierarchy.
- 2026 interaction polish: scroll progress bar, portfolio lightbox, booking confirmation animation, floating WhatsApp CTA, warm editorial empty states, scroll-aware navbar, footer micro-interactions, portfolio card zoom, CTA pulse, service-card lift, and arrow-link nudges.
- Daraja STK Push initiation, persisted payment-attempt tracking, and frontend status polling. Callbacks are acknowledged but deliberately cannot settle invoices until a provider-supported verifier is implemented.
- Health endpoint checks Postgres and Redis.
- CI workflow for frontend lint/tests/build and backend typecheck/tests/migrations/admin seed/build; PostgreSQL 16 and Redis 7 run as CI services.
- `docs/TESTING_DARAJA.md` for sandbox/production M-Pesa STK Push verification.
- `docs/ADMIN_INVOICE_GUIDE.md` for invoice creation, sharing, and payment tracking.
- `docs/JOURNAL_GUIDE.md` for journal publishing and implementation details.

### What's Not Yet Built

- Real Render, Upstash, Vercel, Cloudinary, and Daraja provisioning was not completed from this workspace because account credentials and production domains are not available here.
- Daraja sandbox was not verified end-to-end with a real phone prompt and public webhook URL.
- Full automated Jest/React Testing Library/Supertest suites are not implemented yet.

### Ideas To Add Later

- Automatic WhatsApp or email confirmation after a booking request.
- Client gallery delivery portal with private download links.
- Testimonial collection after completed shoots.
- Analytics showing which portfolio categories generate the most enquiries.
- Invoice PDF export with tax and discount controls.
- Admin activity log so changes can be audited.
- Calendar month navigation and multi-month availability view.
- Automated WhatsApp confirmations (Baileys).
- Automated email confirmations (Nodemailer + Gmail SMTP).
- PDF invoice generation and email delivery (not implemented on the current branch; an unmerged feature branch exists).
- Google Calendar sync.
- Newsletter broadcast to active subscribers.
- Client self-service rescheduling flow.
