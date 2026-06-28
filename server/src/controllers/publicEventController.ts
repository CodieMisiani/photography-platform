import type { Request, Response } from "express";
import {
  createPublicEvent,
  deletePublicEvent,
  listAdminPublicEvents,
  listPublishedPublicEvents,
  updatePublicEvent,
} from "../services/publicEventService.js";

export async function listEvents(_req: Request, res: Response) {
  res.status(200).json({ events: await listPublishedPublicEvents() });
}

export async function listAdminEvents(_req: Request, res: Response) {
  res.status(200).json({ events: await listAdminPublicEvents() });
}

export async function createAdminEvent(req: Request, res: Response) {
  res.status(201).json({ event: await createPublicEvent(req.body) });
}

export async function patchAdminEvent(req: Request, res: Response) {
  res.status(200).json({ event: await updatePublicEvent(String(req.params.id), req.body) });
}

export async function removeAdminEvent(req: Request, res: Response) {
  await deletePublicEvent(String(req.params.id));
  res.status(204).send();
}
