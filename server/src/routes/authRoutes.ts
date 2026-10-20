import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginLimiter } from "../middleware/rateLimiters.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginSchema } from "./schemas.js";
import {
  requireAdminSession,
  requireAllowedOrigin,
} from "../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post(
  "/login",
  requireAllowedOrigin,
  loginLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login),
);
authRoutes.post("/logout", requireAdminSession, asyncHandler(logout));
authRoutes.get("/me", asyncHandler(me));
