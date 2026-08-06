import { Router } from "express";
import {
  createPortfolio,
  createPortfolioPhoto,
  deletePortfolioPhoto,
  listAdminPortfolio, listCategories, createCategory, patchCategory, removeCategory,
  getPortfolioDetail,
  listPortfolio,
  listPortfolioPhotos,
  patchPortfolio,
  patchPortfolioPhoto,
  removePortfolio,
  reorderPortfolioPhotos,
  uploadPortfolioAsset,
} from "../controllers/portfolioController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { mediaUpload } from "../services/mediaService.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  idParamsSchema,
  portfolioCreateSchema,
  portfolioPatchSchema,
} from "./schemas.js";

export const portfolioRoutes = Router();

portfolioRoutes.get("/", asyncHandler(listPortfolio));
portfolioRoutes.get("/admin", requireAdminSession, asyncHandler(listAdminPortfolio));
portfolioRoutes.get("/categories", asyncHandler(listCategories));
portfolioRoutes.post("/categories", requireAdminSession, asyncHandler(createCategory));
portfolioRoutes.patch("/categories/:categoryId", requireAdminSession, asyncHandler(patchCategory));
portfolioRoutes.delete("/categories/:categoryId", requireAdminSession, asyncHandler(removeCategory));
portfolioRoutes.get("/:id", asyncHandler(getPortfolioDetail));
portfolioRoutes.get("/:id/photos", asyncHandler(listPortfolioPhotos));
portfolioRoutes.post(
  "/",
  requireAdminSession,
  validate({ body: portfolioCreateSchema }),
  asyncHandler(createPortfolio),
);
portfolioRoutes.post(
  "/uploads",
  requireAdminSession,
  mediaUpload.single("image"),
  asyncHandler(uploadPortfolioAsset),
);
portfolioRoutes.post(
  "/:id/photos",
  requireAdminSession,
  mediaUpload.single("image"),
  asyncHandler(createPortfolioPhoto),
);
portfolioRoutes.patch(
  "/:id/photos/reorder",
  requireAdminSession,
  asyncHandler(reorderPortfolioPhotos),
);
portfolioRoutes.patch(
  "/:id/photos/:photoId",
  requireAdminSession,
  asyncHandler(patchPortfolioPhoto),
);
portfolioRoutes.delete(
  "/:id/photos/:photoId",
  requireAdminSession,
  asyncHandler(deletePortfolioPhoto),
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
