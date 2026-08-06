import type { IWhatsAppProvider, WhatsAppMessage } from "./WhatsAppProvider.interface.js";

export class MetaAPIProvider implements IWhatsAppProvider {
  isConfigured() { return false; }
  async send(_message: WhatsAppMessage) {
    console.warn("[notifications] Meta WhatsApp provider is not configured; message skipped.");
    return { success: false };
  }
}
