import { z } from "zod";
import { kenyanPhone } from "../lib/validators/phone.js";

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
  whatsapp: kenyanPhone,
  email: z.string().email(),
  event_date: z.string().date(),
  event_type: z.string().min(2).max(120),
  notes: z.string().max(2000).optional().nullable(),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "declined"]),
});

export const bookingPatchSchema = bookingCreateSchema.partial().extend({
  status: z.enum(["pending", "confirmed", "declined"]).optional(),
});

export const quoteCreateSchema = z.object({
  client_name: z.string().min(2).max(160),
  whatsapp: kenyanPhone,
  email: z.string().email(),
  description: z.string().min(10).max(4000),
});

export const quoteStatusSchema = z.object({
  status: z.enum(["new", "responded", "closed"]),
});

export const quotePatchSchema = z.object({
  status: z.enum(["new", "responded", "closed"]).optional(),
  notes: z.string().max(4000).optional().nullable(),
});

export const invoiceLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(2).max(240),
  quantity: z.coerce.number().int().positive(),
  unit_price: z.coerce.number().min(0),
});

export const invoiceCreateSchema = z.object({
  invoice_no: z.string().min(3).max(80).optional(),
  client_name: z.string().min(2).max(160),
  phone: kenyanPhone,
  amount: z.coerce.number().positive().optional(),
  line_items: z.array(invoiceLineItemSchema).min(1).optional(),
});

export const invoicePatchSchema = invoiceCreateSchema
  .extend({
    status: z.enum(["unpaid", "paid", "failed"]).optional(),
    mpesa_ref: z.string().max(160).optional().nullable(),
  })
  .partial();

export const invoicePaySchema = z.object({
  phone: kenyanPhone,
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
  image_url: z.string().url().optional().nullable(),
  price: z.coerce.number().min(0),
  is_published: z.boolean().default(false),
});

export const publicEventPatchSchema = publicEventCreateSchema.partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(10)
    .regex(/(?=.*[a-z])/, "must contain lowercase")
    .regex(/(?=.*[A-Z])/, "must contain uppercase")
    .regex(/(?=.*\d)/, "must contain number")
    .regex(/(?=.*[^A-Za-z0-9])/, "must contain special char"),
});

export const changeEmailSchema = z.object({
  currentPassword: z.string().min(1),
  newEmail: z.string().email(),
});

export const statsPatchSchema = z.object({
  label: z.string().min(1).max(160).optional(),
  value: z.coerce.number().int().min(0).optional(),
  suffix: z.string().max(16).optional().nullable(),
  sort_order: z.coerce.number().int().optional(),
  is_visible: z.boolean().optional(),
});

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email().max(255),
});
