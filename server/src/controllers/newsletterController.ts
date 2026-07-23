import type { Request, Response } from "express";
import {
  deactivateNewsletterSubscriber,
  listNewsletterSubscribers,
  subscribeToNewsletter,
} from "../services/newsletterService.js";
import { sendNewsletterSignupNotification } from "../services/emailService.js";

export async function subscribe(req: Request, res: Response) {
  const result = await subscribeToNewsletter(req.body.email);
  if (!result.alreadySubscribed) {
    sendNewsletterSignupNotification({
      email: result.subscriber.email,
      subscribedAt: result.subscriber.subscribed_at,
      reactivated: result.reactivated,
    }).catch((error: unknown) => {
      console.error("[newsletterController] Newsletter notification failed", {
        error,
      });
    });
  }

  res.status(result.created ? 201 : 200).json({
    ok: true,
    alreadySubscribed: result.alreadySubscribed,
    message: result.alreadySubscribed
      ? "You're already subscribed."
      : "You're subscribed.",
  });
}

export async function getAdminSubscribers(_req: Request, res: Response) {
  res.status(200).json({ subscribers: await listNewsletterSubscribers() });
}

export async function deactivateAdminSubscriber(req: Request, res: Response) {
  const subscriber = await deactivateNewsletterSubscriber(String(req.params.id));
  res.status(200).json({ subscriber });
}
