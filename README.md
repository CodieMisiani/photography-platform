# 📸 Photography Business Platform

A modern photography business platform for event photographers with portfolio, booking, quote requests, admin CMS, invoices, and Daraja payments.

## Features

- Portfolio showcase
- Booking and availability management
- Quote request handling
- Admin CMS for portfolio and content
- Invoice generation and payment flow
- M-Pesa Daraja STK Push payments

## Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query

### Backend

- Node.js
- Express.js
- TypeScript
- Knex.js
- PostgreSQL
- Redis

## Project Structure

- client/: Vite frontend
- server/: Express backend
- docs/: project notes and references

## Local Development

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Start local services

- PostgreSQL
- Redis

### 3. Configure environment variables

Create or update the backend environment file:

```env
NODE_ENV=development
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/photography_platform
REDIS_URL=redis://localhost:6379
SESSION_COOKIE_NAME=studio_admin_session
SESSION_SECRET=development-session-secret-change-me
COOKIE_SECURE=false
ADMIN_EMAIL=nimrodmisiani42@gmail.com
ADMIN_PASSWORD=PhotoStudio@Admin
```

### 4. Run database migrations and seed admin

```bash
cd server
npm run migrate
npm run seed:admin
```

### 5. Start the app

```bash
cd client && npm run dev
cd server && npm run dev
```

## Production Deployment Notes

### Backend

The backend is intended to be deployed on Railway with:

- PostgreSQL service (for example from Neon)
- Redis service (for example from Upstash)
- production environment variables
- admin credentials set through environment variables

Example providers used for this project:

- PostgreSQL: https://console.neon.tech/app/org-orange-unit-01460549/welcome?step=done
- Redis: https://console.upstash.com/redis

### Frontend

The frontend is intended to be deployed on Vercel with:

```env
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

## Admin Access

The default admin login is:

- Email: nimrodmisiani42@gmail.com
- Password: PhotoStudio@Admin

If the login does not work in production, the most common reason is that the backend was deployed before the new password was saved to the environment variables, or the admin user was not reseeded after the change.

For security, rotate the admin password in production environment variables and reseed the admin account when handing the project over.

## Cloudinary and Daraja

These services are wired through environment variables and can be enabled once credentials are available.

- Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Daraja: DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET, DARAJA_PASSKEY, DARAJA_SHORTCODE, DARAJA_CALLBACK_URL

## Handoff Notes for the Next Developer

- Keep secrets in environment variables and deployment dashboard secrets, not in source control.
- Use Railway for backend hosting and Vercel for frontend hosting.
- Test the admin login flow after every environment change.
- Reseed the admin account if credentials change:

```bash
cd server
npm run seed:admin
```

## Development Methodology

This project follows:

- Software Development Life Cycle (SDLC)
- Agile Methodology
- 2-week sprint planning

---

🚧 Project currently in active development
