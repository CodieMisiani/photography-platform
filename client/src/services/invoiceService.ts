import { invoices, invoiceSummary } from "../data/invoiceFixtures";

export async function fetchInvoices() {
  return {
    summary: invoiceSummary,
    invoices,
  };
}
