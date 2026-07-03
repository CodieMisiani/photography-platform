import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAdminSession } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParamsSchema, statsPatchSchema } from "./schemas.js";
import {
  getStats,
  getAdminStats,
  patchAdminStat,
} from "../controllers/statsController.js";

export const statsRoutes = Router();

statsRoutes.get("/stats", asyncHandler(getStats));
statsRoutes.get(
  "/admin/stats",
  requireAdminSession,
  asyncHandler(getAdminStats),
);
statsRoutes.patch(
  "/admin/stats/:id",
  requireAdminSession,
  validate({ params: idParamsSchema, body: statsPatchSchema }),
  asyncHandler(patchAdminStat),
);
