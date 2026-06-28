import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bookingRoutes } from "./routes/bookingRoutes.js";
import { invoiceRoutes } from "./routes/invoiceRoutes.js";
import { portfolioRoutes } from "./routes/portfolioRoutes.js";
import { publicEventRoutes } from "./routes/publicEventRoutes.js";
import { quoteRoutes } from "./routes/quoteRoutes.js";
import { checkHealth } from "./services/healthService.js";
import { asyncHandler } from "./utils/asyncHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(env.SESSION_SECRET));

  app.get(
    "/health",
    asyncHandler(async (_req, res) => {
      const health = await checkHealth();
      res.status(health.ok ? 200 : 503).json(health);
    }),
  );

  app.use("/auth", authRoutes);
  app.use("/portfolio", portfolioRoutes);
  app.use(bookingRoutes);
  app.use(quoteRoutes);
  app.use(invoiceRoutes);
  app.use(publicEventRoutes);

  app.use((_req, _res, next) => {
    next(new AppError(404, "Route not found", "ROUTE_NOT_FOUND"));
  });
  app.use(notFoundHandler);

  return app;
}
