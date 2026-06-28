import type { PublicEventRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";

export async function listPublishedPublicEvents() {
  return db<PublicEventRow>("public_events")
    .select("*")
    .where({ is_published: true })
    .orderBy("event_date", "asc");
}

export async function listAdminPublicEvents() {
  return db<PublicEventRow>("public_events").select("*").orderBy("event_date", "asc");
}

export async function createPublicEvent(payload: Omit<PublicEventRow, "id">) {
  const [created] = await db<PublicEventRow>("public_events").insert(payload).returning("*");
  return created;
}

export async function updatePublicEvent(id: string, payload: Partial<Omit<PublicEventRow, "id">>) {
  const [updated] = await db<PublicEventRow>("public_events")
    .where({ id })
    .update(payload)
    .returning("*");
  if (!updated) {
    throw new AppError(404, "Public event not found", "PUBLIC_EVENT_NOT_FOUND");
  }
  return updated;
}

export async function deletePublicEvent(id: string) {
  const deleted = await db<PublicEventRow>("public_events").where({ id }).delete();
  if (!deleted) {
    throw new AppError(404, "Public event not found", "PUBLIC_EVENT_NOT_FOUND");
  }
}
