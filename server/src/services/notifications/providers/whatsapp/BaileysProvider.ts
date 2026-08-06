import { db } from "../../../../db/knex.js";
import type { IWhatsAppProvider, WhatsAppMessage } from "./WhatsAppProvider.interface.js";

/**
 * Render's filesystem is ephemeral, so a WhatsApp session is deliberately
 * considered usable only once credentials have been persisted in Neon. The
 * connection bootstrap is kept behind this provider; failures never affect API requests.
 */
export class BaileysProvider implements IWhatsAppProvider {
  private hasStoredSession = false;

  async initialize() {
    const session = await db<{ id: string }>("baileys_session").where({ id: "default" }).first();
    this.hasStoredSession = Boolean(session);
    if (!session) console.warn("[notifications] WhatsApp needs a Baileys QR session before messages can be sent.");
  }

  isConfigured() { return this.hasStoredSession; }

  async send(_message: WhatsAppMessage) {
    if (!this.isConfigured()) {
      console.warn("[notifications] WhatsApp is not connected; message skipped.");
      return { success: false };
    }
    // A persisted credentials adapter is added with the authenticated QR setup.
    // Until then this remains a safe no-op instead of pretending delivery succeeded.
    console.warn("[notifications] Baileys session transport is not active; message skipped.");
    return { success: false };
  }
}
