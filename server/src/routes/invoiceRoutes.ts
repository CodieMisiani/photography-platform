import { Router } from "express";
import {
  createAdminInvoice,
  darajaWebhook,
  getAdminInvoicePaymentHistory,
  invoiceStatus,
  listAdminInvoices,
  lookupInvoice,
  payInvoice,
  patchAdminInvoice,
  removeAdminInvoice,
  reconcileAdminInvoicePayment,
} from "../controllers/invoiceController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { publicWriteLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  idParamsSchema,
  invoiceCreateSchema,
  invoicePatchSchema,
  invoiceNoParamsSchema,
  invoicePaySchema,
  invoiceReconciliationSchema,
} from "./schemas.js";

export const invoiceRoutes = Router();

invoiceRoutes.get("/admin/invoices", requireAdminSession, asyncHandler(listAdminInvoices));
invoiceRoutes.post(
  "/admin/invoices",
  requireAdminSession,
  validate({ body: invoiceCreateSchema }),
  asyncHandler(createAdminInvoice),
);
invoiceRoutes.patch(
  "/admin/invoices/:id",
  requireAdminSession,
  validate({ params: idParamsSchema, body: invoicePatchSchema }),
  asyncHandler(patchAdminInvoice),
);
invoiceRoutes.delete(
  "/admin/invoices/:id",
  requireAdminSession,
  validate({ params: idParamsSchema }),
  asyncHandler(removeAdminInvoice),
);
invoiceRoutes.get(
  "/admin/invoices/:id/payment-history",
  requireAdminSession,
  validate({ params: idParamsSchema }),
  asyncHandler(getAdminInvoicePaymentHistory),
);
invoiceRoutes.post(
  "/admin/invoices/:id/reconcile",
  requireAdminSession,
  validate({ params: idParamsSchema, body: invoiceReconciliationSchema }),
  asyncHandler(reconcileAdminInvoicePayment),
);
invoiceRoutes.get(
  "/invoices/:invoiceNo",
  publicWriteLimiter,
  validate({ params: invoiceNoParamsSchema }),
  asyncHandler(lookupInvoice),
);
invoiceRoutes.post(
  "/invoices/:id/pay",
  publicWriteLimiter,
  validate({ params: idParamsSchema, body: invoicePaySchema }),
  asyncHandler(payInvoice),
);
invoiceRoutes.get(
  "/invoices/:id/status",
  validate({ params: idParamsSchema }),
  asyncHandler(invoiceStatus),
);
invoiceRoutes.post("/webhooks/daraja", asyncHandler(darajaWebhook));
