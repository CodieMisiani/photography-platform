# Admin Image Upload Guide

This project uses two image paths:

- Homepage editorial images live in `client/src/assets/images/home` as optimized local assets.
- Portfolio and public event images are uploaded through the admin dashboard, stored in Cloudinary, and referenced from PostgreSQL.

Do not upload production portfolio photos by editing code. Use the admin dashboard so Cloudinary and the database stay in sync.

## Before You Upload

1. Confirm the backend has Cloudinary environment variables:

   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_FOLDER=malume-photography
   ```

2. Keep original photos in a safe local folder, for example `Website Pics`.
3. Use JPEG photos when possible.
4. Keep filenames clear and stable before upload.

Recommended filename style:

```text
YYYY-MM-DD_short-description_001.jpg
```

Example:

```text
2026-08-01_family-celebration_001.jpg
```

## Upload Portfolio Images

1. Open the live website admin login page.
2. Sign in as an admin.
3. Open `Portfolio`.
4. Choose `Add Project`.
5. Fill in:
   - Project title
   - Category
   - Event date
   - Featured status
6. Choose the image file from your local image folder.
7. Save the project.

What happens automatically:

1. The backend validates the image type and size.
2. The image uploads to Cloudinary under `malume-photography/portfolio`.
3. Cloudinary returns a secure image URL and public ID.
4. The backend saves the URL and public ID in PostgreSQL.
5. The public portfolio displays the image from the database.

## Replace Portfolio Images

1. Open `Portfolio` in the admin dashboard.
2. Select `Edit` on the project.
3. Choose a replacement image.
4. Save.

The backend stores the new Cloudinary URL and public ID. If the old image has a stored public ID, the backend attempts to remove the old Cloudinary asset.

## Upload Public Event Images

1. Open `Events` in the admin dashboard.
2. Create or edit a public event.
3. Choose an image file.
4. Save.

Public event uploads go to `malume-photography/events`.

## Verify Uploads

After saving:

1. Confirm the admin page shows the image preview.
2. Open the public portfolio or public events page.
3. Confirm the image loads on desktop and mobile.
4. In Cloudinary, confirm the image exists in the expected folder.

## Troubleshooting

- If upload fails, confirm Cloudinary env vars are set in Render.
- If the image saves but does not display, check that the database row has `cover_url` or `image_url`.
- If replacement cleanup does not remove an old image, the older row may not have a stored Cloudinary public ID.
- Do not delete database rows manually unless you have a backup.

## Homepage Images

The homepage marquee uses optimized local images from:

```text
client/src/assets/images/home
```

The current homepage assets were generated from selected production photos in the provided `Website Pics` folder. Keep these files small because they ship with the frontend bundle.
