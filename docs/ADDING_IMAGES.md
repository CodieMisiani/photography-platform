# Adding Images

## Part A - For The Photographer

All photos are managed from the admin dashboard. You do not need to touch code, folders, hosting, or Cloudinary.

### Step 1 - Log in

Go to your website followed by `/admin/login`. Your developer will give you the full link. Enter your admin email and password.

### Step 2 - Go to Portfolio

Open Portfolio from the sidebar on desktop or the menu on mobile.

### Step 3 - Add a new photo

Create a portfolio item with:

- Title, for example `Wanjiku & James Wedding`
- Category, for example `Wedding`, `Corporate`, `Portrait`, or `Events`
- Event Date
- Cover Image upload
- Featured toggle if the image should appear more prominently

Save the form and the image goes live.

### Step 4 - Replace a photo

Edit the portfolio item, upload a new cover image, and save.

### Step 5 - Delete a photo

Delete the portfolio item from the admin dashboard. The item is removed from the website.

### Best photo sizes

| Type | Minimum size | Format |
| --- | --- | --- |
| Landscape weddings or events | 2400 x 1600px | JPEG |
| Portraits or maternity | 1600 x 2400px | JPEG |
| Square crops | 1200 x 1200px | JPEG |

Use JPEG for normal photographs. Use PNG only for images that need transparency. Keep files under 10MB before uploading.

### File naming

Use this format:

```text
YYYY-MM-DD_description_number.jpg
```

Examples:

```text
2024-03-15_wanjiku-james-wedding_001.jpg
2024-06-01_karen-corporate-headshots_003.jpg
2024-12-25_nairobi-family-portraits_012.jpg
```

Use no spaces. Hyphens and underscores are fine.

### What happens after upload

1. The image is sent to Cloudinary.
2. Cloudinary stores the original.
3. The website saves the image URL.
4. Visitors see the optimized image on the portfolio.

## Part B - For The Developer

Portfolio and public event image uploads go through the backend Cloudinary client. Keep Cloudinary credentials in `server/.env` locally or Railway secrets in production. Do not expose Cloudinary API secrets to the frontend.

Recommended production checks:

- Confirm `CLOUDINARY_FOLDER=malume-photography`.
- Confirm upload limits and file type validation are enabled in the backend.
- Confirm portfolio images lazy-load on public pages.
- Confirm public event image URLs render when present.
