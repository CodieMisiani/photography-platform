import type { Request, Response } from "express";
import { uploadMedia } from "../services/mediaService.js";
import {
  createJournalPost,
  deleteJournalPost,
  getJournalPostBySlug,
  listAllJournalPosts,
  listPublishedJournalPosts,
  updateJournalPost,
} from "../services/journalService.js";

export async function listJournal(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 9);
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;

  res
    .status(200)
    .json(await listPublishedJournalPosts({ page, limit, category }));
}

export async function getJournalDetail(req: Request, res: Response) {
  res
    .status(200)
    .json({ post: await getJournalPostBySlug(String(req.params.slug)) });
}

export async function listAdminJournal(_req: Request, res: Response) {
  res.status(200).json({ posts: await listAllJournalPosts() });
}

export async function createAdminJournal(req: Request, res: Response) {
  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";
  const excerpt =
    typeof req.body?.excerpt === "string" ? req.body.excerpt.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body : "";
  const category =
    typeof req.body?.category === "string" ? req.body.category.trim() : "";
  const isPublishedValue = req.body?.is_published;
  const isPublished = isPublishedValue === "true" || isPublishedValue === true;

  if (!title || !excerpt || !body) {
    res
      .status(400)
      .json({ error: { message: "Title, excerpt, and body are required" } });
    return;
  }

  if (excerpt.length > 300) {
    res
      .status(400)
      .json({ error: { message: "Excerpt must be 300 characters or fewer" } });
    return;
  }

  let coverUrl: string | null = null;
  let coverPublicId: string | null = null;

  if (req.file) {
    const upload = await uploadMedia(req.file, { folder: "journal" });
    coverUrl = upload.url;
    coverPublicId = upload.public_id;
  }

  const post = await createJournalPost({
    title,
    excerpt,
    body,
    category: category || null,
    is_published: isPublished,
    cover_url: coverUrl,
    cover_public_id: coverPublicId,
  });

  res.status(201).json({ post });
}

export async function updateAdminJournal(req: Request, res: Response) {
  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : undefined;
  const excerpt =
    typeof req.body?.excerpt === "string" ? req.body.excerpt.trim() : undefined;
  const body = typeof req.body?.body === "string" ? req.body.body : undefined;
  const category =
    typeof req.body?.category === "string"
      ? req.body.category.trim()
      : undefined;
  const isPublishedValue = req.body?.is_published;
  const isPublished = isPublishedValue === "true" || isPublishedValue === true;

  let coverUrl: string | null | undefined;
  let coverPublicId: string | null | undefined;

  if (req.file) {
    const upload = await uploadMedia(req.file, { folder: "journal" });
    coverUrl = upload.url;
    coverPublicId = upload.public_id;
  }

  const post = await updateJournalPost(String(req.params.id), {
    title,
    excerpt,
    body,
    category: category || null,
    is_published: isPublished,
    cover_url: coverUrl,
    cloudinary_public_id: coverPublicId,
  });

  res.status(200).json({ post });
}

export async function deleteAdminJournal(req: Request, res: Response) {
  await deleteJournalPost(String(req.params.id));
  res.status(204).send();
}
