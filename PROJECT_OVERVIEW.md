# Photography Platform Overview

## Section A - Explain It Like I'm Five

This project is a website and control room for a photography studio.

A visitor can open the website, look at the studio's photography work, see public studio events, request a quote for a bigger creative idea, book a specific open date, and pay an invoice with M-Pesa.

An admin can sign in to a private dashboard and manage the business: portfolio photos, client bookings, quote requests, invoices, payment status, blocked calendar dates, and public event listings.

Think of the system like a real studio:

- The frontend is the storefront. It is what visitors and admins see in the browser.
- The backend is the back office. It receives forms, checks login sessions, stores records, and talks to outside services.
- Postgres is the filing cabinet. It keeps bookings, quotes, invoices, events, and portfolio records.
- Redis is the wristband at the door. It remembers which admin is logged in for eight hours.
- Cloudinary is the photo shelf. It stores uploaded portfolio images.
- Daraja is the messenger to M-Pesa. It sends the STK Push prompt and reports whether the payment worked.

## Section B - Technical Setup & Handoff Doc

### Architecture

The browser runs the React/Vite frontend in `client`. React components call one typed API layer at `client/src/lib/api.ts`. That API layer calls the Express backend in `server`. Express validates requests with Zod, checks admin sessions with Redis, reads and writes Postgres through Knex, uploads portfolio images to Cloudinary, and triggers M-Pesa STK Push through Safaricom Daraja.

The homepage image marquee reads from `homeMarqueeImages` in `client/src/data/homeFixtures.ts`. Swap real portfolio photo URLs there when production assets are ready; the homepage consumes the list automatically and duplicates it for the seamless loop.

Flow in words:

`React pages -> typed API client -> Express routes/controllers -> services -> Postgres/Redis/Cloudinary/Daraja`

### Environment Variables

These match `server/.env.example`.

- `NODE_ENV`: `development`, `test`, or `production`.
- `PORT`: Backend port, usually `4000` locally.
- `CLIENT_ORIGIN`: Frontend URL allowed by CORS, for example Vercel production URL.
- `DATABASE_URL`: PostgreSQL connection string from Railway.
- `REDIS_URL`: Redis connection string from Railway Redis or Upstash.
- `SESSION_COOKIE_NAME`: Admin session cookie name.
- `SESSION_SECRET`: Long random secret for signed cookies.
- `COOKIE_SECURE`: `true` in production HTTPS, `false` locally.
- `ADMIN_EMAIL`: Email address for the first admin user.
- `ADMIN_PASSWORD`: Temporary password used by `npm run seed:admin`.
- `ADMIN_PASSWORD_HASH`: Optional bcrypt hash fallback if no plain seed password is supplied.
- `CLOUDINARY_CLOUD_NAME`: From Cloudinary dashboard.
- `CLOUDINARY_API_KEY`: From Cloudinary dashboard.
- `CLOUDINARY_API_SECRET`: From Cloudinary dashboard.
- `DARAJA_ENV`: `sandbox` or `production`.
- `DARAJA_CONSUMER_KEY`: From Safaricom Daraja app.
- `DARAJA_CONSUMER_SECRET`: From Safaricom Daraja app.
- `DARAJA_PASSKEY`: Daraja STK Push passkey.
- `DARAJA_SHORTCODE`: Paybill/till shortcode.
- `DARAJA_CALLBACK_URL`: Public backend URL ending in `/webhooks/daraja`.

For the frontend, set `VITE_API_BASE_URL` to the backend URL.

### Environment Variables - Where To Get Each One

- Railway dashboard: `DATABASE_URL`, `REDIS_URL`, `PORT`.
- Cloudinary dashboard: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Safaricom Daraja developer portal: `DARAJA_CONSUMER_KEY`, `DARAJA_CONSUMER_SECRET`, `DARAJA_PASSKEY`, `DARAJA_SHORTCODE`, `DARAJA_CALLBACK_URL`.
- Self-generated: `SESSION_SECRET` as a long random string, `SESSION_COOKIE_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Vercel project settings: `VITE_API_BASE_URL`, set to the Railway backend URL.

### Local Setup

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

3. Create `server/.env` from `server/.env.example` and fill real local or Railway/Postgres/Redis values.

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
npm run lint
npm run build
```

```bash
cd server
npm run typecheck
npm run build
npm run migrate
```

GitHub Actions are configured in `.github/workflows/ci.yml`. CI installs frontend/backend dependencies, runs frontend lint/build, runs backend typecheck/build, starts throwaway Postgres and Redis services, and runs migrations plus admin seeding.

Full Jest/React Testing Library/Supertest test suites are still not built.

### Deployment Topology

Planned deployment:

- Frontend: Vercel.
- Backend API: Railway.
- PostgreSQL: Railway managed Postgres.
- Redis: Upstash or Railway Redis.
- Media: Cloudinary.
- Payments: Safaricom Daraja.

To deploy:

1. Create Railway backend service from `server`.
2. Add Railway Postgres and Redis/Upstash URLs to backend env vars.
3. Run `npm run migrate` and `npm run seed:admin` against production.
4. Deploy frontend from `client` to Vercel.
5. Set `VITE_API_BASE_URL` in Vercel to the Railway backend URL.
6. Set Daraja callback URL to `https://your-api-domain/webhooks/daraja`.
7. Confirm `/health` returns Postgres and Redis as healthy.
8. Test admin login, booking creation, quote submission, invoice creation, and M-Pesa sandbox payment.

Rollback:

- Vercel: promote a previous deployment.
- Railway: redeploy a previous successful build.
- Database: use backups/snapshots before running destructive migrations.

### What's Finished

- React/Vite/Tailwind frontend with the existing monochrome editorial design preserved.
- Homepage refinement with clean hero and moving image marquee.
- Mobile hamburger menu with keyboard/focus handling.
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
- Portfolio CMS full inline editing for title, category, event date, cover URL/upload, and featured state.
- Booking admin page with full booking editing, booking status changes, and date block/unblock.
- Quote inbox with status changes and internal notes.
- Invoice admin create/edit/delete with multiple line items and computed totals.
- Public invoice lookup shows itemized line items.
- Public events admin create/edit/delete/publish toggle with image URL/upload support.
- Public events render real uploaded event images when present.
- Footer privacy/terms links resolve to real routes.
- Navbar hover uses a center-morph underline and subtle letter-spacing transition with reduced-motion support.
- Daraja STK Push trigger, webhook update, and frontend polling/failure timeout.
- Health endpoint checks Postgres and Redis.
- CI workflow for lint/build/typecheck/migration check.

### What's Not Yet Built

- Real Railway, Upstash, Vercel, Cloudinary, and Daraja provisioning was not completed from this workspace because account credentials and production domains are not available here.
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
- Client self-service rescheduling flow.
