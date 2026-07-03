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

### Image optimization

Upload full-resolution photographs. Cloudinary handles optimized delivery for the website.

### Removing images

When a portfolio item is deleted through the admin dashboard, the stored database record is deleted. If Cloudinary asset deletion is extended later, keep deletion inside the backend service so the admin never manages files manually.
