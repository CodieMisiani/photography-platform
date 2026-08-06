# Journal Guide

## For Malume

The Journal is where you can share photography stories, behind-the-scenes moments, tips, and updates. It helps prospective clients get to know your work and gives the site useful content for search engines.

### Add a post

1. Sign in to the admin dashboard and choose **Journal**.
2. Fill in the title, excerpt (up to 300 characters), category, cover image, and article body.
3. Use **Publish immediately** to make it public, or leave it unchecked to save a draft.
4. Click **Publish Post**. Published stories appear at `/journal`.

### Edit, unpublish, or delete

Use **Edit** beside a post to update its content, cover image, category, or publication state. **Unpublish** returns a live post to draft status and removes it from the public site. **Delete** permanently removes the post and attempts to remove its Cloudinary cover image.

## For developers

- Posts live in Neon PostgreSQL's `journal_posts` table.
- The editor saves Markdown; the public page renders it through `@uiw/react-md-editor` with Tailwind Typography styles.
- Cover images are uploaded to Cloudinary in `malume-photography/journal/`.
- Public endpoints are `GET /journal` and `GET /journal/:slug`.
- Session-protected CRUD is under `/admin/journal`.
- Slugs are generated from titles and made unique by adding numeric suffixes.
- Read time is calculated server-side at 200 words per minute.
