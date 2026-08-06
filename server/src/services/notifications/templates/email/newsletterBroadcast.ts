import { emailLayout } from "./base.js";
export function newsletterBroadcastEmail(html: string, unsubscribeUrl: string) {
  return { html: emailLayout(`${html}<hr/><p><a href="${unsubscribeUrl}">Unsubscribe</a></p>`), text: "Please view this newsletter in an HTML-enabled email client." };
}
