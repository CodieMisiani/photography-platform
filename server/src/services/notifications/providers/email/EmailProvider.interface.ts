export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
};

export interface IEmailProvider {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string }>;
  isConfigured(): boolean;
}
