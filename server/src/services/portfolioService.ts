import type { EventRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";
import { deleteMedia } from "./mediaService.js";

export async function listPortfolioEvents(): Promise<EventRow[]> {
  return db<EventRow>("events").select("*").orderBy("event_date", "desc");
}

export async function createPortfolioEvent(payload: Omit<EventRow, "id" | "created_at">) {
  const [created] = await db<EventRow>("events").insert(payload).returning("*");
  return created;
}

export async function updatePortfolioEvent(id: string, payload: Partial<Omit<EventRow, "id" | "created_at">>) {
  const current = await db<EventRow>("events").where({ id }).first();
  if (!current) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
  const [updated] = await db<EventRow>("events").where({ id }).update(payload).returning("*");
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
