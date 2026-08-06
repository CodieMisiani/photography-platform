import { Router } from "express";
import {
  createAdminJournal,
  deleteAdminJournal,
  getJournalDetail,
  listAdminJournal,
  listJournal,
  updateAdminJournal,
} from "../controllers/journalController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { mediaUpload } from "../services/mediaService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const journalRoutes = Router();
export const adminJournalRoutes = Router();

journalRoutes.get("/", asyncHandler(listJournal));
journalRoutes.get("/:slug", asyncHandler(getJournalDetail));

adminJournalRoutes.get(
  "/",
  requireAdminSession,
  asyncHandler(listAdminJournal),
);
adminJournalRoutes.post(
  "/",
  requireAdminSession,
  mediaUpload.single("cover"),
  asyncHandler(createAdminJournal),
);
adminJournalRoutes.patch(
  "/:id",
  requireAdminSession,
  mediaUpload.single("cover"),
  asyncHandler(updateAdminJournal),
);
adminJournalRoutes.delete(
  "/:id",
  requireAdminSession,
  asyncHandler(deleteAdminJournal),
);
