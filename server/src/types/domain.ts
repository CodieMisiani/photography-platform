export type BookingStatus = "pending" | "confirmed" | "declined";
export type QuoteStatus = "new" | "responded" | "closed";
export type InvoiceStatus = "unpaid" | "paid" | "failed";

export type EventRow = {
  id: string;
  title: string;
  category: string;
  cover_url: string | null;
  cover_public_id: string | null;
  event_date: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
};

export type ProjectPhotoRow = {
  id: string;
  event_id: string;
  cloudinary_url: string;
  cloudinary_public_id: string | null;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
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
  image_public_id: string | null;
  price: string;
  is_published: boolean;
};

export type AdminSession = {
  email: string;
  createdAt: string;
};

export type NewsletterSubscriberRow = {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
};

export type JournalPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  cloudinary_public_id: string | null;
  category: string | null;
  read_time_minutes: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
