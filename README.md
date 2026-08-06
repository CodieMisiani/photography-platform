# Malume Photography Platform

A production-ready photography business platform for Malume Photography. The app combines a premium editorial public website with a secure admin dashboard for portfolio management, bookings, quotes, invoices, newsletter subscribers, public events, Cloudinary uploads, and M-Pesa Daraja payments.

## Current Features

- Editorial homepage with warm monochrome design, moving photography marquee, scroll progress, floating WhatsApp CTA, and refined micro-interactions.
- Dedicated About page for the Malume Photography brand story, philosophy, creative process, and service positioning.
- Journal landing page for editorial stories, photography notes, client stories, featured galleries, and behind-the-scenes content.
- Portfolio page powered by API data, category filtering, animated hover states, and keyboard-accessible lightbox.
- Public events page powered by API data with loading, error, and empty states.
- Book Me calendar flow with availability lookup, booking form, and animated booking confirmation.
- Request a Quote flow with multi-step inquiry form and clear studio copy.
- Public invoice lookup and payment routes, including `/pay-invoice` and `/invoice/:invoiceNo`.
- Daraja STK Push payment initiation, webhook handling, status polling, and backend payment logs.
- Newsletter subscription with duplicate-aware messaging, SMTP notification support, and admin subscriber management.
- Secure admin login with Redis-backed sessions and protected admin routes.
- Admin dashboard for bookings, calendar blocks, quotes, invoices, portfolio CMS, public events, stats, settings, and newsletter subscribers.
- Cloudinary image uploads for portfolio and public event images, including stored public IDs for cleanup on replace/delete.
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
- Email: SMTP for newsletter notifications.
- CI/CD: GitHub Actions workflow for lint/build/typecheck/migration checks.

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

1. Install frontend dependencies:

   ```bash
   cd client
   npm install
   ```

2. Install backend dependencies:

   ```bash
   cd server
   npm install
   ```

3. Start local PostgreSQL and Redis.

4. Create `server/.env` from `server/.env.example` and fill real local values.

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
npm run lint
npm run build
```

Backend:

```bash
cd server
npm run typecheck
npm run build
```

Database:

```bash
cd server
npm run migrate
```

## Deployment Notes

- Frontend: deploy `client/` to Vercel with `VITE_API_BASE_URL` pointing to the backend API.
- Backend: deploy `server/` to Railway or Render with PostgreSQL, Redis/Upstash, Cloudinary, SMTP, and Daraja environment variables configured.
- Database: run `npm run migrate` against the production `DATABASE_URL` before server startup. The server schema guard fails fast if required tables are missing.
- Media: set Cloudinary credentials. Portfolio uploads use `malume-photography/portfolio`; public event uploads use `malume-photography/events`.
- Newsletter: set SMTP credentials and `NEWSLETTER_NOTIFY_EMAIL`.
- Payments: set Daraja credentials and a public `DARAJA_CALLBACK_URL` ending in `/webhooks/daraja`.
- Security: use HTTPS, secure cookies in production, strong admin credentials, and deployment-managed secrets only.

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
- `docs/ADDING_IMAGES.md`
- `docs/JOURNAL_GUIDE.md`
- `PROJECT_OVERVIEW.md`
