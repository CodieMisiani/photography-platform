import { db } from "../db/knex.js";
import type { NewsletterSubscriberRow } from "../types/domain.js";

export async function subscribeToNewsletter(
  email: string,
): Promise<{
  subscriber: NewsletterSubscriberRow;
  created: boolean;
  alreadySubscribed: boolean;
  reactivated: boolean;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db<NewsletterSubscriberRow>("newsletter_subscribers")
    .where({ email: normalizedEmail })
    .first();

  if (existing?.is_active) {
    return {
      subscriber: existing,
      created: false,
      alreadySubscribed: true,
      reactivated: false,
    };
  }

  if (existing) {
    const [subscriber] = await db<NewsletterSubscriberRow>(
      "newsletter_subscribers",
    )
      .where({ id: existing.id })
      .update({ is_active: true, subscribed_at: db.fn.now() })
      .returning("*");
    return {
      subscriber,
      created: false,
      alreadySubscribed: false,
      reactivated: true,
    };
  }

  const [subscriber] = await db<NewsletterSubscriberRow>(
    "newsletter_subscribers",
  )
    .insert({ email: normalizedEmail })
    .returning("*");

  return {
    subscriber,
    created: true,
    alreadySubscribed: false,
    reactivated: false,
  };
}

export async function listNewsletterSubscribers(): Promise<
  NewsletterSubscriberRow[]
> {
  return db<NewsletterSubscriberRow>("newsletter_subscribers")
    .select()
    .orderBy("subscribed_at", "desc");
}

export async function deactivateNewsletterSubscriber(
  id: string,
): Promise<NewsletterSubscriberRow> {
  const [subscriber] = await db<NewsletterSubscriberRow>(
    "newsletter_subscribers",
  )
    .where({ id })
    .update({ is_active: false })
    .returning("*");

  return subscriber;
}
