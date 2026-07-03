# Malume Photography Platform

A production-ready photography business platform with portfolio management, bookings, quote requests, invoices, M-Pesa Daraja payments, Cloudinary uploads, and a secure admin dashboard.

## Features

- Editorial portfolio and public events pages
- Book Me calendar flow and separate Request a Quote flow
- Admin dashboard for bookings, quotes, invoices, portfolio, stats, public events, settings, and newsletter subscribers
- Redis-backed admin sessions
- PostgreSQL migrations through Knex
- Cloudinary media upload path
- Daraja STK Push invoice payment flow
- Kenya localization for KSh, +254 phone numbers, and DD/MM/YYYY dates

## Project Structure

- `client/` - React + Vite + TypeScript + Tailwind frontend
- `server/` - Node.js + Express + TypeScript backend
- `docs/` - setup guides and handoff reports
- `.github/workflows/` - CI checks

## Local Development

1. Install dependencies:

   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```

2. Start local PostgreSQL and Redis.

3. Create `server/.env` from `server/.env.example` and fill real local values.

   Admin credentials are set securely via the seed script against your live database. See `server/.env.example` for the variable names. Never commit real values.

4. Run migrations and seed the admin:

   ```bash
   cd server
   npm run migrate
   npm run seed:admin
   ```

5. Start both apps:

   ```bash
   cd server
   npm run dev
   ```

   ```bash
   cd client
   npm run dev
   ```

## Verification Commands

```bash
cd client
npm run lint
npm run build
```

```bash
cd server
npm run typecheck
npm run build
```

## Deployment Notes

- Frontend: Vercel with `VITE_API_BASE_URL` pointing to the backend URL.
- Backend: Railway with PostgreSQL and Redis/Upstash environment variables.
- Media: Cloudinary credentials in Railway environment variables.
- Payments: Safaricom Daraja credentials in Railway environment variables.

Never place real credentials in README files, source files, or tracked `.env` files. Use the deployment dashboard secret manager or a local untracked `server/.env`.

## Setup Guides

- `docs/CLOUDINARY_SETUP.md`
- `docs/DARAJA_SETUP.md`
- `docs/ADDING_IMAGES.md`
- `PROJECT_OVERVIEW.md`
