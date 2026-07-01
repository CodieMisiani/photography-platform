export type BookingStatus = "pending" | "confirmed" | "declined";
export type QuoteStatus = "new" | "responded" | "closed";
export type InvoiceStatus = "unpaid" | "paid" | "failed";

export type EventRow = {
  id: string;
  title: string;
  category: string;
  cover_url: string;
  event_date: string;
  is_featured: boolean;
  created_at: string;
};

export type BookingRow = {
  id: string;
  client_name: string;
  whatsapp: string;
  email: string;
  event_date: string;
  event_type: string;
  status: BookingStatus;
  notes: string | null;
};

export type QuoteRequestRow = {
  id: string;
  client_name: string;
  whatsapp: string;
  email: string;
  description: string;
  notes: string | null;
  status: QuoteStatus;
  created_at: string;
};

export type InvoiceRow = {
  id: string;
  invoice_no: string;
  client_name: string;
  phone: string;
  amount: string;
  status: InvoiceStatus;
  mpesa_ref: string | null;
  paid_at: string | null;
};

export type InvoiceLineItemRow = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: string;
  created_at: string;
};

export type CalendarBlockRow = {
  id: string;
  blocked_date: string;
  reason: string;
  booking_id: string | null;
};

export type PublicEventRow = {
  id: string;
  title: string;
  venue: string;
  event_date: string;
  ticket_url: string | null;
  image_url: string | null;
  price: string;
  is_published: boolean;
};

export type AdminSession = {
  email: string;
  createdAt: string;
};
