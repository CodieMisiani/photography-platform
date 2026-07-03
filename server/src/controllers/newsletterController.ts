import type { Request, Response } from "express";
import {
  deactivateNewsletterSubscriber,
  listNewsletterSubscribers,
  subscribeToNewsletter,
} from "../services/newsletterService.js";

export async function subscribe(req: Request, res: Response) {
  const result = await subscribeToNewsletter(req.body.email);
  res.status(result.created ? 201 : 200).json({ ok: true });
}

export async function getAdminSubscribers(_req: Request, res: Response) {
  res.status(200).json({ subscribers: await listNewsletterSubscribers() });
}

export async function deactivateAdminSubscriber(req: Request, res: Response) {
  const subscriber = await deactivateNewsletterSubscriber(String(req.params.id));
  res.status(200).json({ subscriber });
}
