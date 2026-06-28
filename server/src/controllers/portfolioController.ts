import type { Request, Response } from "express";
import {
  createPortfolioEvent,
  deletePortfolioEvent,
  listPortfolioEvents,
  updatePortfolioEvent,
} from "../services/portfolioService.js";
import { uploadPortfolioImage } from "../services/mediaService.js";

export async function listPortfolio(req: Request, res: Response) {
  res.status(200).json({ events: await listPortfolioEvents() });
}

export async function createPortfolio(req: Request, res: Response) {
  res.status(201).json({ event: await createPortfolioEvent(req.body) });
}

export async function patchPortfolio(req: Request, res: Response) {
  res.status(200).json({ event: await updatePortfolioEvent(String(req.params.id), req.body) });
}

export async function removePortfolio(req: Request, res: Response) {
  await deletePortfolioEvent(String(req.params.id));
  res.status(204).send();
}

export async function uploadPortfolioAsset(req: Request, res: Response) {
  res.status(201).json(await uploadPortfolioImage(req.file));
}
