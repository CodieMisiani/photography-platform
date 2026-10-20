# Cloudinary Setup

## Part A - For The Business Owner

### What is Cloudinary?

Cloudinary is the service that stores and delivers all your portfolio photos. When you upload an image through the admin dashboard, it goes to Cloudinary automatically. You never have to manage files manually.

### What you need to do

You do not need to do anything after initial setup. Your developer sets up Cloudinary once. After that, you upload photos through the admin dashboard and they appear on the website automatically.

### What your developer needs from you

Nothing. The developer can create the Cloudinary account on your behalf, or you can create a free account at [cloudinary.com](https://cloudinary.com) and share the credentials securely.

## Part B - For The Developer

### Step 1 - Create a Cloudinary account

1. Go to [https://cloudinary.com](https://cloudinary.com).
2. Sign up for a free account.
3. The free tier is enough for an early photography portfolio.

### Step 2 - Get credentials

1. Log in to the Cloudinary dashboard.
2. Open Settings, then Access Keys.
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

Treat the API Secret like a password.

### Step 3 - Add environment variables

Add these values to `server/.env` locally or Railway environment variables in production:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=malume-photography
```

Keep `CLOUDINARY_FOLDER=malume-photography` unless the client wants a different storage folder.

### Step 4 - Verify the connection

Start the backend from `server/`:

```bash
npm run dev
```

If Cloudinary credentials are wrong, the upload route will fail when testing an upload.

### Step 5 - Test an upload

1. Log in to the admin dashboard.
2. Open Portfolio.
3. Upload a test image.
4. Confirm the image appears in Cloudinary.
5. Confirm the website displays the uploaded image.

### Folder structure

```text
malume-photography/
  portfolio/
  events/
```

### Image optimization and delivery

Keep the uploaded original in Cloudinary; do not manually convert or overwrite it. Public frontend image components request Cloudinary delivery variants with `f_auto,q_auto`, a layout-appropriate width, and `c_limit`. Cloudinary negotiates an output format supported by the visitor's browser and the quality setting, so the same asset can be delivered as a modern format such as WebP/AVIF where available. The browser receives responsive `srcset` candidates and selects one using viewport and device conditions. Images not hosted on Cloudinary and the local homepage marquee images do not use this Cloudinary transformation path.

Portfolio cards and gallery previews request smaller widths than the project detail lightbox. Below-the-fold public images are lazy-loaded; the lead project image and selected lead content are prioritized. If a transformed Cloudinary URL fails, the component retries the original URL before displaying an accessible placeholder. Verify actual `Content-Type`, selected `currentSrc`, dimensions, and transfer size in browser DevTools; this repository has not recorded production before/after Lighthouse or Core Web Vitals measurements.

### Removing images

When a portfolio item is deleted through the admin dashboard, the stored database record is deleted. If Cloudinary asset deletion is extended later, keep deletion inside the backend service so the admin never manages files manually.
