# Admin Image Upload Guide

This project uses two image paths:

- Homepage editorial images live in `client/src/assets/images/home` as optimized local assets.
- Portfolio and public event images are uploaded through the admin dashboard, stored in Cloudinary, and referenced from PostgreSQL.

Do not upload production portfolio photos by editing code. Use the admin dashboard so Cloudinary and the database stay in sync.

## Before You Upload

### Server validation and limits

Portfolio cover assets, each gallery image, public-event images, and journal covers accept JPEG, PNG, and WebP. The server requires the filename extension, multipart MIME declaration, and decoded image format to agree. Sharp/libvips inspects dimensions and fully decodes the image before the original bytes are sent to Cloudinary; uploaded photography is not recompressed by the application.

The shared server limits are:

- Maximum compressed file size: 15 MiB per image.
- Maximum width: 12,000 pixels.
- Maximum height: 12,000 pixels.
- Maximum total pixels: 40 million.
- Maximum files in a multipart request: 1. Gallery selection can contain multiple photos, but the CMS sends each photo in its own request.
- Animated WebP and other multi-page images are rejected.

These limits are enforced in the backend after the admin session, Origin, and CSRF checks and during multipart parsing; invalid or over-limit images are rejected before Cloudinary is called. There is no upload-specific environment configuration. Automated tests use generated in-memory images and a mocked Cloudinary boundary; they do not verify Cloudinary or production hosting behavior.

### Runtime and workflow verification status

The server imports Sharp directly and declares `sharp: "0.35.3"` in `server/package.json`; the lockfile root dependency matches, and npm 10.9.2 accepts the complete lock tree with `npm ls --package-lock-only --all`. Sharp requires Node >=20.9; CI and the Dockerfile use Node 22 (the Docker image is Alpine), while `render.yaml` does not pin Node. On Windows x64/Node 22.16.0, installed package resolution still fails with `EPERM` while trying to `lstat C:\Users\NIMROD`. An isolated offline install lacked cached packages; registry fetches failed with `EACCES`. No clean install or Sharp native load/fixture decode completed, and no Docker or WSL Linux environment is installed. Confirm the target Linux binary by a clean install and in-memory decode in CI or staging before release.

Local verification also passed all seven JPEGs in `client/src/assets/images/home` through the server validator (each 1800 × 1350). These are repository homepage assets, not a production portfolio inventory. No production Cloudinary assets were inspected. The automated suite verifies decoding, rejection, parser limits, and the mocked upload boundary; it does not exercise a database-backed create/edit/gallery/event/journal workflow. Gallery photo and journal create/update upload to Cloudinary before writing their row, with no compensating delete if the database write fails, so that failure can leave an orphaned asset. Portfolio cover and public-event uploads are separate upload-then-save actions with the same abandoned-asset risk. Before production, add a staged integration check using isolated database and Cloudinary test boundaries, verify failure compensation, and confirm actual server memory/timeout behavior under realistic image batches.

The parser uses memory storage. A valid 40-megapixel image can require substantial decoded working memory, and the CMS sends selected gallery files concurrently as separate requests. There is no upload-specific concurrency gate or app-level upload timeout; server/host defaults apply. The Render plan is listed as free, but this repository does not establish a memory budget or measured capacity. The per-file and pixel limits bound one upload; they do not prove safety under concurrent upload bursts. Stage-load validation and a bounded server-side upload concurrency policy remain release checks.

Deletion also has provider/database consistency gaps: portfolio-event and public-event deletion attempt Cloudinary deletion before deleting the database row, while gallery/journal deletion removes the row first and `deleteMedia` logs and continues on provider failure. These paths can respectively leave a database reference to a deleted asset or leave an unreferenced Cloudinary asset. Existing automated cleanup tests cover portfolio cover replacement persistence ordering, not these provider/database failure cases.

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

Public Cloudinary images are delivered through frontend-generated responsive transformations (`f_auto,q_auto`, bounded widths, and `c_limit`); uploaded originals and asset IDs are not rewritten. A browser can choose among `srcset` widths according to its viewport and the component's `sizes` value. Gallery cards use smaller candidates than the detailed lightbox. Verify a real request in DevTools: inspect `currentSrc`, response `Content-Type`, image dimensions, and transferred bytes. The repository has no recorded production Lighthouse baseline, so do not treat a specific percentage improvement as measured.

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
