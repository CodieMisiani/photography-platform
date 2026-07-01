import type { EventRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";

export async function listPortfolioEvents(): Promise<EventRow[]> {
  return db<EventRow>("events").select("*").orderBy("event_date", "desc");
}

export async function createPortfolioEvent(payload: Omit<EventRow, "id" | "created_at">) {
  const [created] = await db<EventRow>("events").insert(payload).returning("*");
  return created;
}

export async function updatePortfolioEvent(id: string, payload: Partial<Omit<EventRow, "id" | "created_at">>) {
  const [updated] = await db<EventRow>("events").where({ id }).update(payload).returning("*");
  if (!updated) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
  return updated;
}

export async function deletePortfolioEvent(id: string) {
  const deleted = await db<EventRow>("events").where({ id }).delete();
  if (!deleted) {
    throw new AppError(404, "Portfolio event not found", "PORTFOLIO_NOT_FOUND");
  }
}
