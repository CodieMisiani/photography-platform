import type { JournalPostRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";
import { deleteMedia } from "./mediaService.js";
import { countWordsFromHtml, slugify } from "../utils/slugify.js";

export async function listPublishedJournalPosts(options: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  const page = Math.max(1, Number(options.page ?? 1));
  const limit = Math.min(24, Math.max(1, Number(options.limit ?? 9)));
  const category = options.category?.trim();

  let query = db<JournalPostRow>("journal_posts")
    .select(
      "id",
      "slug",
      "title",
      "excerpt",
      "cover_url",
      "category",
      "read_time_minutes",
      "published_at",
    )
    .where({ is_published: true })
    .orderBy("published_at", "desc")
    .orderBy("created_at", "desc");

  if (category) {
    query = query.whereILike("category", `%${category}%`);
  }

  const totalQuery = query
    .clone()
    .count<{ count: string }[]>({ count: "*" as never });
  const [totalRow] = await totalQuery;
  const total = Number(totalRow?.count ?? 0);
  const posts = await query.offset((page - 1) * limit).limit(limit);

  return {
    posts,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function listAllJournalPosts() {
  return db<JournalPostRow>("journal_posts")
    .select(
      "id",
      "slug",
      "title",
      "excerpt",
      "cover_url",
      "category",
      "read_time_minutes",
      "is_published",
      "published_at",
      "created_at",
      "updated_at",
    )
    .orderBy("published_at", "desc")
    .orderBy("created_at", "desc");
}

export async function getJournalPostBySlug(slug: string) {
  const post = await db<JournalPostRow>("journal_posts")
    .where({ slug })
    .first();
  if (!post || !post.is_published) {
    throw new AppError(404, "Journal post not found", "JOURNAL_POST_NOT_FOUND");
  }
  return post;
}

export async function createJournalPost(payload: {
  title: string;
  excerpt: string;
  body: string;
  category?: string | null;
  is_published: boolean;
  cover_url?: string | null;
  cover_public_id?: string | null;
}) {
  const slug = await generateUniqueSlug(payload.title);
  const readTime = Math.max(
    1,
    Math.ceil(countWordsFromHtml(payload.body) / 200),
  );
  const [created] = await db<JournalPostRow>("journal_posts")
    .insert({
      slug,
      title: payload.title,
      excerpt: payload.excerpt,
      body: payload.body,
      cover_url: payload.cover_url ?? null,
      cloudinary_public_id: payload.cover_public_id ?? null,
      category: payload.category?.trim() || null,
      read_time_minutes: readTime,
      is_published: payload.is_published,
      published_at: payload.is_published ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .returning("*");

  return created;
}

export async function updateJournalPost(
  id: string,
  payload: Partial<{
    title: string;
    excerpt: string;
    body: string;
    category: string | null;
    is_published: boolean;
    cover_url: string | null;
    cloudinary_public_id: string | null;
  }>,
) {
  const existing = await db<JournalPostRow>("journal_posts")
    .where({ id })
    .first();
  if (!existing) {
    throw new AppError(404, "Journal post not found", "JOURNAL_POST_NOT_FOUND");
  }

  const updates: Partial<JournalPostRow> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.excerpt !== undefined) updates.excerpt = payload.excerpt;
  if (payload.body !== undefined) updates.body = payload.body;
  if (payload.category !== undefined)
    updates.category = payload.category?.trim() || null;
  if (payload.cover_url !== undefined) updates.cover_url = payload.cover_url;
  if (payload.cloudinary_public_id !== undefined) {
    updates.cloudinary_public_id = payload.cloudinary_public_id;
  }

  if (payload.title !== undefined && payload.title !== existing.title) {
    updates.slug = await generateUniqueSlug(payload.title, existing.id);
  }

  if (payload.body !== undefined) {
    updates.read_time_minutes = Math.max(
      1,
      Math.ceil(countWordsFromHtml(payload.body) / 200),
    );
  }

  if (payload.is_published !== undefined) {
    updates.is_published = payload.is_published;
    updates.published_at = payload.is_published
      ? (existing.published_at ?? new Date().toISOString())
      : null;
  }

  const [updated] = await db<JournalPostRow>("journal_posts")
    .where({ id })
    .update(updates)
    .returning("*");
  if (!updated) {
    throw new AppError(404, "Journal post not found", "JOURNAL_POST_NOT_FOUND");
  }
  return updated;
}

export async function deleteJournalPost(id: string) {
  const existing = await db<JournalPostRow>("journal_posts")
    .where({ id })
    .first();
  if (!existing) {
    throw new AppError(404, "Journal post not found", "JOURNAL_POST_NOT_FOUND");
  }

  const deleted = await db<JournalPostRow>("journal_posts")
    .where({ id })
    .delete();
  if (!deleted) {
    throw new AppError(404, "Journal post not found", "JOURNAL_POST_NOT_FOUND");
  }

  if (existing.cloudinary_public_id) {
    await deleteMedia(existing.cloudinary_public_id);
  }
}

async function generateUniqueSlug(title: string, excludeId?: string) {
  const baseSlug = slugify(title) || "journal-entry";
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db<JournalPostRow>("journal_posts")
      .where({ slug: candidate })
      .whereNot({ id: excludeId })
      .first();
    if (!existing) {
      return candidate;
    }
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
