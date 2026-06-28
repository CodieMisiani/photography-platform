export type InvoiceStatus = "Paid" | "Sent" | "Draft" | "Pending";

export type Invoice = {
  id: string;
  client: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
  initials: string;
};

export type InvoiceSummary = {
  totalRevenue: string;
  pendingAmount: string;
  paidCount: string;
  draftCount: string;
};
