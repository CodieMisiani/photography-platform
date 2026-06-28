import { Router } from "express";
import {
  createPublicQuote,
  listAdminQuotes,
  patchQuoteStatus,
} from "../controllers/quoteController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { publicWriteLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { idParamsSchema, quoteCreateSchema, quoteStatusSchema } from "./schemas.js";

export const quoteRoutes = Router();

quoteRoutes.post(
  "/quotes",
  publicWriteLimiter,
  validate({ body: quoteCreateSchema }),
  asyncHandler(createPublicQuote),
);
quoteRoutes.get("/admin/quotes", requireAdminSession, asyncHandler(listAdminQuotes));
quoteRoutes.patch(
  "/admin/quotes/:id/status",
  requireAdminSession,
  validate({ params: idParamsSchema, body: quoteStatusSchema }),
  asyncHandler(patchQuoteStatus),
);
