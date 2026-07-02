import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAdminSession } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  changePassword,
  changeEmail,
} from "../controllers/adminAccountController.js";
import { accountChangeLimiter } from "../middleware/rateLimiters.js";
import { changePasswordSchema, changeEmailSchema } from "./schemas.js";

export const adminAccountRoutes = Router();

adminAccountRoutes.patch(
  "/admin/account/password",
  requireAdminSession,
  accountChangeLimiter,
  validate({ body: changePasswordSchema }),
  asyncHandler(changePassword),
);

adminAccountRoutes.patch(
  "/admin/account/email",
  requireAdminSession,
  accountChangeLimiter,
  validate({ body: changeEmailSchema }),
  asyncHandler(changeEmail),
);
