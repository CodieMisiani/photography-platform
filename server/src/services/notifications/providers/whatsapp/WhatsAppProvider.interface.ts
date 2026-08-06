export type WhatsAppMessage = { to: string; body: string; mediaUrl?: string };

export interface IWhatsAppProvider {
  send(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string }>;
  isConfigured(): boolean;
}
