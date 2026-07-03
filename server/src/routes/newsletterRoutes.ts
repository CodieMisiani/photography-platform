import { Router } from "express";
import {
  deactivateAdminSubscriber,
  getAdminSubscribers,
  subscribe,
} from "../controllers/newsletterController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { newsletterLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { idParamsSchema, newsletterSubscribeSchema } from "./schemas.js";

export const newsletterRoutes = Router();

newsletterRoutes.post(
  "/newsletter/subscribe",
  newsletterLimiter,
  validate({ body: newsletterSubscribeSchema }),
  asyncHandler(subscribe),
);

newsletterRoutes.get(
  "/admin/newsletter/subscribers",
  requireAdminSession,
  asyncHandler(getAdminSubscribers),
);

newsletterRoutes.patch(
  "/admin/newsletter/subscribers/:id/deactivate",
  requireAdminSession,
  validate({ params: idParamsSchema }),
  asyncHandler(deactivateAdminSubscriber),
);
