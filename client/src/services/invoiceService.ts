import { api, type ApiInvoice } from "../lib/api";

const moneyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export async function fetchInvoices() {
  const { invoices } = await api.invoices.list();
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const unpaidInvoices = invoices.filter((invoice) => invoice.status === "unpaid");

  return {
    summary: {
      totalRevenue: moneyFormatter.format(sumInvoices(paidInvoices)),
      pendingAmount: moneyFormatter.format(sumInvoices(unpaidInvoices)),
      paidCount: String(paidInvoices.length).padStart(2, "0"),
      draftCount: "00",
    },
    invoices: invoices.map(mapInvoiceRow),
  };
}

export async function fetchPayableInvoice(invoiceId: string) {
  const { invoice } = await api.invoices.lookup(invoiceId.trim().toUpperCase());

  return {
    id: invoice.invoice_no,
    databaseId: invoice.id,
    dueDate: "Due on receipt",
    status: mapInvoiceStatus(invoice.status),
    total: moneyFormatter.format(Number(invoice.amount)),
    lineItems: [
      {
        description: "Photography services",
        amount: moneyFormatter.format(Number(invoice.amount)),
      },
    ],
  };
}

function mapInvoiceRow(invoice: ApiInvoice) {
  return {
    id: invoice.invoice_no,
    client: invoice.client_name,
    amount: moneyFormatter.format(Number(invoice.amount)),
    dueDate: invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "Due on receipt",
    status: mapInvoiceStatus(invoice.status),
    initials: invoice.client_name.slice(0, 1).toUpperCase(),
  };
}

function mapInvoiceStatus(status: ApiInvoice["status"]) {
  if (status === "paid") {
    return "Paid" as const;
  }
  if (status === "failed") {
    return "Failed";
  }
  return "Pending" as const;
}

function sumInvoices(invoices: ApiInvoice[]) {
  return invoices.reduce((total, invoice) => total + Number(invoice.amount), 0);
}
