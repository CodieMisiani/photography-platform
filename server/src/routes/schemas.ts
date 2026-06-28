import { z } from "zod";

export const idParamsSchema = z.object({
  id: z.string().uuid(),
});

export const invoiceNoParamsSchema = z.object({
  invoiceNo: z.string().min(3).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const portfolioCreateSchema = z.object({
  title: z.string().min(2).max(160),
  category: z.string().min(2).max(80),
  cover_url: z.string().url(),
  event_date: z.string().date(),
  is_featured: z.boolean().default(false),
});

export const portfolioPatchSchema = portfolioCreateSchema.partial();

export const bookingCreateSchema = z.object({
  client_name: z.string().min(2).max(160),
  whatsapp: z.string().min(7).max(40),
  email: z.string().email(),
  event_date: z.string().date(),
  event_type: z.string().min(2).max(120),
  notes: z.string().max(2000).optional().nullable(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "declined"]),
});

export const quoteCreateSchema = z.object({
  client_name: z.string().min(2).max(160),
  whatsapp: z.string().min(7).max(40),
  email: z.string().email(),
  description: z.string().min(10).max(4000),
});

export const quoteStatusSchema = z.object({
  status: z.enum(["new", "responded", "closed"]),
});

export const invoiceCreateSchema = z.object({
  invoice_no: z.string().min(3).max(80).optional(),
  client_name: z.string().min(2).max(160),
  phone: z.string().min(7).max(40),
  amount: z.coerce.number().positive(),
});

export const invoicePatchSchema = invoiceCreateSchema
  .extend({
    status: z.enum(["unpaid", "paid", "failed"]).optional(),
    mpesa_ref: z.string().max(160).optional().nullable(),
  })
  .partial();

export const invoicePaySchema = z.object({
  phone: z.string().min(7).max(40),
});

export const calendarAvailabilityQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
});

export const calendarBlockCreateSchema = z.object({
  blocked_date: z.string().date(),
  reason: z.string().min(2).max(160),
  booking_id: z.string().uuid().optional().nullable(),
});

export const publicEventCreateSchema = z.object({
  title: z.string().min(2).max(160),
  venue: z.string().min(2).max(160),
  event_date: z.string().date(),
  ticket_url: z.string().url().optional().nullable(),
  price: z.coerce.number().min(0),
  is_published: z.boolean().default(false),
});

export const publicEventPatchSchema = publicEventCreateSchema.partial();
