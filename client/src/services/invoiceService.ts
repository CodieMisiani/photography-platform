import { invoices, invoiceSummary, payableInvoice } from "../data/invoiceFixtures";

export async function fetchInvoices() {
  return {
    summary: invoiceSummary,
    invoices,
  };
}

export async function fetchPayableInvoice(invoiceId: string) {
  return {
    ...payableInvoice,
    id: invoiceId.trim().toUpperCase() || payableInvoice.id,
  };
}
