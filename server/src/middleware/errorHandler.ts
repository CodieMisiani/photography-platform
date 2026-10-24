import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export function createErrorHandler(
  isProduction = env.NODE_ENV === "production",
): ErrorRequestHandler {
  return (error, _req, res, _next) => {
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
    if (isProduction) {
      console.error("[http] Unhandled request error", {
        name: isError ? error.name : "UnknownError",
      });
    } else {
      console.error("[http] Unhandled request error", error);
    }

    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: isProduction
          ? "Something went wrong"
          : isError
            ? error.message
            : "Something went wrong",
        ...(!isProduction && isError ? { stack: error.stack } : {}),
      },
    });
  };
}

export const notFoundHandler = createErrorHandler();
