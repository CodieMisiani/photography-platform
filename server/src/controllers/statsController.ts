import type { Request, Response } from "express";
import {
  listVisibleStats,
  listAllStats,
  updateStat,
} from "../services/statsService.js";

export async function getStats(_req: Request, res: Response) {
  res.status(200).json({ stats: await listVisibleStats() });
}

export async function getAdminStats(_req: Request, res: Response) {
  res.status(200).json({ stats: await listAllStats() });
}

export async function patchAdminStat(req: Request, res: Response) {
  const id = String(req.params.id);
  const stat = await updateStat(id, req.body);
  res.status(200).json({ stat });
}
