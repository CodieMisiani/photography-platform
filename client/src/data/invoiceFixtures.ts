import type { Invoice, InvoiceSummary, PayableInvoice } from "../types/invoice";

export const invoiceSummary: InvoiceSummary = {
  totalRevenue: "KSh 42,850",
  pendingAmount: "KSh 12,400",
  paidCount: "08",
  draftCount: "03",
};

export const invoices: Invoice[] = [
  {
    id: "INV-2024-089",
    client: "Vogue Italia",
    amount: "KSh 12,500",
    dueDate: "Oct 24, 2024",
    status: "Sent",
    initials: "V",
  },
  {
    id: "INV-2024-088",
    client: "Arc'teryx Editorial",
    amount: "KSh 8,200",
    dueDate: "Oct 18, 2024",
    status: "Paid",
    initials: "A",
  },
  {
    id: "INV-2024-087",
    client: "Museum of Modern Art",
    amount: "KSh 15,000",
    dueDate: "Nov 02, 2024",
    status: "Draft",
    initials: "M",
  },
];

export const payableInvoice: PayableInvoice = {
  id: "EL-2024-8842",
  dueDate: "Dec 15, 2024",
  status: "Pending",
  total: "Ksh 60,500",
  lineItems: [
    {
      description: "Editorial Shoot (Full Day)",
      amount: "Ksh 45,000",
    },
    {
      description: "Post-Production & Retouching",
      amount: "Ksh 12,500",
    },
    {
      description: "Travel Expenses (Nairobi Outskirts)",
      amount: "Ksh 3,000",
    },
  ],
};
