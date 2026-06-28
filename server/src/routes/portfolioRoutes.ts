import multer from "multer";
import { Router } from "express";
import {
  createPortfolio,
  listPortfolio,
  patchPortfolio,
  removePortfolio,
  uploadPortfolioAsset,
} from "../controllers/portfolioController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { idParamsSchema, portfolioCreateSchema, portfolioPatchSchema } from "./schemas.js";

const upload = multer({ storage: multer.memoryStorage() });

export const portfolioRoutes = Router();

portfolioRoutes.get("/", asyncHandler(listPortfolio));
portfolioRoutes.post(
  "/",
  requireAdminSession,
  validate({ body: portfolioCreateSchema }),
  asyncHandler(createPortfolio),
);
portfolioRoutes.patch(
  "/:id",
  requireAdminSession,
  validate({ params: idParamsSchema, body: portfolioPatchSchema }),
  asyncHandler(patchPortfolio),
);
portfolioRoutes.delete(
  "/:id",
  requireAdminSession,
  validate({ params: idParamsSchema }),
  asyncHandler(removePortfolio),
);
portfolioRoutes.post(
  "/uploads",
  requireAdminSession,
  upload.single("image"),
  asyncHandler(uploadPortfolioAsset),
);
