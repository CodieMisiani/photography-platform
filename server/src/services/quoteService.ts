import type { QuoteRequestRow, QuoteStatus } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";

export async function createQuoteRequest(payload: Omit<QuoteRequestRow, "id" | "status" | "created_at">) {
  const [created] = await db<QuoteRequestRow>("quote_requests")
    .insert({ ...payload, status: "new" })
    .returning("*");
  return created;
}

export async function listQuoteRequests() {
  return db<QuoteRequestRow>("quote_requests").select("*").orderBy("created_at", "desc");
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  const [updated] = await db<QuoteRequestRow>("quote_requests").where({ id }).update({ status }).returning("*");
  if (!updated) {
    throw new AppError(404, "Quote request not found", "QUOTE_NOT_FOUND");
  }
  return updated;
}
