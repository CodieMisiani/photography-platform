import type { Invoice, InvoiceSummary } from "../types/invoice";

export const invoiceSummary: InvoiceSummary = {
  totalRevenue: "$42,850.00",
  pendingAmount: "$12,400.00",
  paidCount: "08",
  draftCount: "03",
};

export const invoices: Invoice[] = [
  {
    id: "INV-2024-089",
    client: "Vogue Italia",
    amount: "$12,500.00",
    dueDate: "Oct 24, 2024",
    status: "Sent",
    initials: "V",
  },
  {
    id: "INV-2024-088",
    client: "Arc'teryx Editorial",
    amount: "$8,200.00",
    dueDate: "Oct 18, 2024",
    status: "Paid",
    initials: "A",
  },
  {
    id: "INV-2024-087",
    client: "Museum of Modern Art",
    amount: "$15,000.00",
    dueDate: "Nov 02, 2024",
    status: "Draft",
    initials: "M",
  },
];
