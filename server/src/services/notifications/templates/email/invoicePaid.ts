import { emailLayout } from "./base.js";
export function invoicePaidEmail(invoice: { client_name: string; invoice_no: string; amount: string; mpesa_ref: string | null }) {
  const text = `Hi ${invoice.client_name}, payment for invoice ${invoice.invoice_no} (KSh ${invoice.amount}) has been received. M-Pesa reference: ${invoice.mpesa_ref ?? "not available"}.`;
  return { subject: `Payment Confirmed — Invoice ${invoice.invoice_no}`, text, html: emailLayout(`<h1>Payment confirmed</h1><p>${text}</p>`) };
}
