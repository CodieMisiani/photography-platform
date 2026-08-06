import { emailLayout } from "./base.js";
export function testimonialRequestEmail(name: string, url: string) {
  const text = `Hi ${name}, how was your experience with Malume Photography? Your feedback takes only 2 minutes: ${url}`;
  return { subject: "How was your experience with Malume Photography?", text, html: emailLayout(`<h1>Share your experience</h1><p>${text}</p>`) };
}
