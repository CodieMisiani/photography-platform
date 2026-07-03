import type { Knex } from "knex";
import { db } from "../db/knex.js";

export type SiteStat = {
  id: string;
  key: string;
  label: string;
  value: number;
  suffix?: string | null;
  sort_order: number;
  is_visible: boolean;
};

export async function listVisibleStats(): Promise<SiteStat[]> {
  return db<SiteStat>("site_stats")
    .select()
    .where({ is_visible: true })
    .orderBy("sort_order", "asc");
}

export async function listAllStats(): Promise<SiteStat[]> {
  return db<SiteStat>("site_stats").select().orderBy("sort_order", "asc");
}

export async function updateStat(
  id: string,
  patch: Partial<
    Pick<SiteStat, "label" | "value" | "suffix" | "sort_order" | "is_visible">
  >,
): Promise<SiteStat> {
  const [row] = await db<SiteStat>("site_stats")
    .where({ id })
    .update(patch)
    .returning("*");
  return row;
}
