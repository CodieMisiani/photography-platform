import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFoundHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        issues: error.issues,
      },
    });
    return;
  }

  const isError = error instanceof Error;
  const isProduction = env.NODE_ENV === "production";

  if (isProduction) {
    console.error("[api] Unhandled request error", {
      errorType: isError ? error.name : "NonErrorThrown",
      method: req.method,
      route: req.route?.path ?? "unmatched",
    });
  } else {
    console.error("[api] Unhandled request error", error);
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        isError && !isProduction ? error.message : "Something went wrong",
      ...(isError && !isProduction ? { stack: error.stack } : {}),
    },
  });
};
