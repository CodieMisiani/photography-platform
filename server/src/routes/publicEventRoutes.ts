import { Router } from "express";
import {
  createAdminEvent,
  listAdminEvents,
  listEvents,
  patchAdminEvent,
  removeAdminEvent,
} from "../controllers/publicEventController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  idParamsSchema,
  publicEventCreateSchema,
  publicEventPatchSchema,
} from "./schemas.js";

export const publicEventRoutes = Router();

publicEventRoutes.get("/events", asyncHandler(listEvents));
publicEventRoutes.get("/admin/public-events", requireAdminSession, asyncHandler(listAdminEvents));
publicEventRoutes.post(
  "/admin/public-events",
  requireAdminSession,
  validate({ body: publicEventCreateSchema }),
  asyncHandler(createAdminEvent),
);
publicEventRoutes.patch(
  "/admin/public-events/:id",
  requireAdminSession,
  validate({ params: idParamsSchema, body: publicEventPatchSchema }),
  asyncHandler(patchAdminEvent),
);
publicEventRoutes.delete(
  "/admin/public-events/:id",
  requireAdminSession,
  validate({ params: idParamsSchema }),
  asyncHandler(removeAdminEvent),
);
