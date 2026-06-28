export type InvoiceStatus = "Paid" | "Sent" | "Draft" | "Pending";

export type Invoice = {
  id: string;
  client: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
  initials: string;
};

export type InvoiceLineItem = {
  description: string;
  amount: string;
};

export type PayableInvoice = {
  id: string;
  dueDate: string;
  status: InvoiceStatus;
  total: string;
  lineItems: InvoiceLineItem[];
};

export type InvoiceSummary = {
  totalRevenue: string;
  pendingAmount: string;
  paidCount: string;
  draftCount: string;
};
