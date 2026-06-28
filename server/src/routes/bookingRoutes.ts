import { Router } from "express";
import {
  createBlock,
  createPublicBooking,
  getAvailability,
  listAdminBookings,
  listBlocks,
  patchBookingStatus,
  removeBlock,
} from "../controllers/bookingController.js";
import { requireAdminSession } from "../middleware/auth.js";
import { publicWriteLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  bookingCreateSchema,
  bookingStatusSchema,
  calendarAvailabilityQuerySchema,
  calendarBlockCreateSchema,
  idParamsSchema,
} from "./schemas.js";

export const bookingRoutes = Router();

bookingRoutes.get(
  "/calendar/availability",
  validate({ query: calendarAvailabilityQuerySchema }),
  asyncHandler(getAvailability),
);
bookingRoutes.post(
  "/bookings",
  publicWriteLimiter,
  validate({ body: bookingCreateSchema }),
  asyncHandler(createPublicBooking),
);
bookingRoutes.get("/admin/bookings", requireAdminSession, asyncHandler(listAdminBookings));
bookingRoutes.get("/admin/calendar-blocks", requireAdminSession, asyncHandler(listBlocks));
bookingRoutes.patch(
  "/admin/bookings/:id/status",
  requireAdminSession,
  validate({ params: idParamsSchema, body: bookingStatusSchema }),
  asyncHandler(patchBookingStatus),
);
bookingRoutes.post(
  "/admin/calendar-blocks",
  requireAdminSession,
  validate({ body: calendarBlockCreateSchema }),
  asyncHandler(createBlock),
);
bookingRoutes.delete(
  "/admin/calendar-blocks/:id",
  requireAdminSession,
  validate({ params: idParamsSchema }),
  asyncHandler(removeBlock),
);
