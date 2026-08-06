import type { BookingRow, InvoiceRow } from "../../types/domain.js";
import { createEmailProvider, createWhatsAppProvider } from "../../config/notifications.js";
import type { IEmailProvider } from "./providers/email/EmailProvider.interface.js";
import type { IWhatsAppProvider } from "./providers/whatsapp/WhatsAppProvider.interface.js";
import { bookingConfirmationEmail } from "./templates/email/bookingConfirmation.js";
import { invoicePaidEmail } from "./templates/email/invoicePaid.js";
import { newsletterBroadcastEmail } from "./templates/email/newsletterBroadcast.js";
import { testimonialRequestEmail } from "./templates/email/testimonialRequest.js";
import { bookingConfirmationWhatsApp } from "./templates/whatsapp/bookingConfirmation.js";
import { invoicePaidWhatsApp } from "./templates/whatsapp/invoicePaid.js";
import { testimonialRequestWhatsApp } from "./templates/whatsapp/testimonialRequest.js";

export class NotificationService {
  constructor(private email: IEmailProvider, private whatsapp: IWhatsAppProvider) {}
  async sendBookingConfirmation(booking: BookingRow) {
    const jobs: Promise<unknown>[] = [];
    if (booking.email) jobs.push(this.email.send({ to: booking.email, ...bookingConfirmationEmail(booking) }));
    if (booking.whatsapp) jobs.push(this.whatsapp.send({ to: booking.whatsapp, body: bookingConfirmationWhatsApp(booking) }));
    await Promise.allSettled(jobs);
  }
  async sendInvoicePaidConfirmation(invoice: InvoiceRow & { email?: string | null }) {
    const jobs: Promise<unknown>[] = [this.whatsapp.send({ to: invoice.phone, body: invoicePaidWhatsApp(invoice) })];
    if (invoice.email) jobs.push(this.email.send({ to: invoice.email, ...invoicePaidEmail(invoice) }));
    await Promise.allSettled(jobs);
  }
  async sendTestimonialRequest(booking: BookingRow, url: string) {
    await Promise.allSettled([
      this.email.send({ to: booking.email, ...testimonialRequestEmail(booking.client_name, url) }),
      this.whatsapp.send({ to: booking.whatsapp, body: testimonialRequestWhatsApp(booking.client_name, url) }),
    ]);
  }
  async sendNewsletterBroadcast(subject: string, html: string, recipients: string[]) {
    return Promise.all(recipients.map((to) => this.email.send({ to, subject, ...newsletterBroadcastEmail(html, "") })));
  }
  async sendInvoiceWithPDF(invoice: InvoiceRow & { email?: string | null }, pdfBuffer: Buffer) {
    if (!invoice.email) return { success: false };
    return this.email.send({ to: invoice.email, subject: `Invoice ${invoice.invoice_no}`, html: "Your invoice is attached.", attachments: [{ filename: `${invoice.invoice_no}.pdf`, content: pdfBuffer, contentType: "application/pdf" }] });
  }
}

export const notificationService = new NotificationService(createEmailProvider(), createWhatsAppProvider());
