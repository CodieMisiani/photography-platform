import type { EventRow, ProjectPhotoRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";
import { deleteMedia } from "./mediaService.js";

export async function listPortfolioEvents(options?: {
  featured?: boolean;
  limit?: number;
}): Promise<EventRow[]> {
  let query = db<EventRow>("events").select("*");

  if (options?.featured) {
    query = query.where({ is_featured: true });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return query.orderBy("event_date", "desc").orderBy("created_at", "desc");
}

export async function getPortfolioEvent(id: string): Promise<EventRow> {
  const event = await db<EventRow>("events").where({ id }).first();
  if (!event) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
  return event;
}

export async function createPortfolioEvent(
  payload: Omit<EventRow, "id" | "created_at">,
) {
  const [created] = await db<EventRow>("events").insert(payload).returning("*");
  return created;
}

export async function updatePortfolioEvent(
  id: string,
  payload: Partial<Omit<EventRow, "id" | "created_at">>,
) {
  const current = await db<EventRow>("events").where({ id }).first();
  if (!current) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
  const [updated] = await db<EventRow>("events")
    .where({ id })
    .update(payload)
    .returning("*");
  if (!updated) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
  if (
    payload.cover_public_id &&
    current.cover_public_id &&
    payload.cover_public_id !== current.cover_public_id
  ) {
    await deleteMedia(current.cover_public_id);
  }
  return updated;
}

export async function deletePortfolioEvent(id: string) {
  const existing = await db<EventRow>("events").where({ id }).first();
  if (!existing) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
  await deleteMedia(existing.cover_public_id);
  const deleted = await db<EventRow>("events").where({ id }).delete();
  if (!deleted) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
}

export async function listProjectPhotos(
  eventId: string,
): Promise<ProjectPhotoRow[]> {
  return db<ProjectPhotoRow>("project_photos")
    .where({ event_id: eventId })
    .orderBy("sort_order", "asc")
    .orderBy("created_at", "asc");
}

export async function createProjectPhoto(
  eventId: string,
  payload: {
    cloudinary_url: string;
    cloudinary_public_id: string;
    caption?: string | null;
    sort_order?: number;
  },
) {
  const [created] = await db<ProjectPhotoRow>("project_photos")
    .insert({
      event_id: eventId,
      cloudinary_url: payload.cloudinary_url,
      cloudinary_public_id: payload.cloudinary_public_id,
      caption: payload.caption?.trim() || null,
      sort_order: payload.sort_order ?? 0,
    })
    .returning("*");
  return created;
}

export async function updateProjectPhoto(
  eventId: string,
  photoId: string,
  payload: { caption?: string | null; sort_order?: number },
) {
  const existing = await db<ProjectPhotoRow>("project_photos")
    .where({ id: photoId, event_id: eventId })
    .first();
  if (!existing) {
    throw new AppError(
      404,
      "Project photo not found",
      "PROJECT_PHOTO_NOT_FOUND",
    );
  }

  const updates: Partial<ProjectPhotoRow> = {};
  if (payload.caption !== undefined) {
    updates.caption = payload.caption?.trim() || null;
  }
  if (payload.sort_order !== undefined) {
    updates.sort_order = payload.sort_order;
  }

  const [updated] = await db<ProjectPhotoRow>("project_photos")
    .where({ id: photoId, event_id: eventId })
    .update(updates)
    .returning("*");

  return updated;
}

export async function deleteProjectPhoto(eventId: string, photoId: string) {
  const existing = await db<ProjectPhotoRow>("project_photos")
    .where({ id: photoId, event_id: eventId })
    .first();
  if (!existing) {
    throw new AppError(
      404,
      "Project photo not found",
      "PROJECT_PHOTO_NOT_FOUND",
    );
  }

  const deleted = await db<ProjectPhotoRow>("project_photos")
    .where({ id: photoId, event_id: eventId })
    .delete();
  if (!deleted) {
    throw new AppError(
      404,
      "Project photo not found",
      "PROJECT_PHOTO_NOT_FOUND",
    );
  }

  await deleteMedia(existing.cloudinary_public_id);
}

export async function reorderProjectPhotos(
  eventId: string,
  photos: Array<{ id: string; sort_order: number }>,
) {
  await db.transaction(async (trx) => {
    for (const photo of photos) {
      await trx<ProjectPhotoRow>("project_photos")
        .where({ id: photo.id, event_id: eventId })
        .update({ sort_order: photo.sort_order });
    }
  });

  return listProjectPhotos(eventId);
}
