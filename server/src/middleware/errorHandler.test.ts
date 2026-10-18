import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import { notFoundHandler } from "./errorHandler.js";

type ErrorPayload = {
  error: {
    code: string;
    message: string;
    stack?: string;
    issues?: unknown;
  };
};

function invokeHandler(error: unknown) {
  let statusCode: number | undefined;
  let payload: ErrorPayload | undefined;

  const response = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: ErrorPayload) {
      payload = body;
      return this;
    },
  } as unknown as Response;

  const request = {
    method: "GET",
    route: { path: "/admin/invoices/:id/pdf" },
  } as unknown as Request;

  notFoundHandler(error, request, response, (() => undefined) as NextFunction);

  if (statusCode === undefined || payload === undefined) {
    throw new Error("Error handler did not send a response");
  }
  return { statusCode, payload };
}

test("unexpected production errors do not disclose diagnostics", () => {
  assert.equal(process.env.NODE_ENV, "production");

  const originalConsoleError = console.error;
  const logCalls: unknown[][] = [];
  console.error = (...args: unknown[]) => {
    logCalls.push(args);
  };

  try {
    const internalError = new Error(
      "SQL password leaked from C:\\app\\server\\payments.ts",
    );
    const { statusCode, payload } = invokeHandler(internalError);

    assert.equal(statusCode, 500);
    assert.deepEqual(payload, {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      },
    });
    assert.equal("stack" in payload.error, false);
    assert.equal(JSON.stringify(payload).includes(internalError.message), false);
    assert.equal(JSON.stringify(payload).includes("payments.ts"), false);
    assert.deepEqual(logCalls, [
      [
        "[api] Unhandled request error",
        {
          errorType: "Error",
          method: "GET",
          route: "/admin/invoices/:id/pdf",
        },
      ],
    ]);
  } finally {
    console.error = originalConsoleError;
  }
});

test("expected application errors retain their intended status and message", () => {
  const { statusCode, payload } = invokeHandler(
    new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND"),
  );

  assert.equal(statusCode, 404);
  assert.deepEqual(payload, {
    error: {
      code: "INVOICE_NOT_FOUND",
      message: "Invoice not found",
    },
  });
});

test("validation errors retain the established safe response contract", () => {
  let validationError: unknown;

  try {
    z.object({ invoiceId: z.string().uuid() }).parse({ invoiceId: "invalid" });
  } catch (error) {
    validationError = error;
  }

  const { statusCode, payload } = invokeHandler(validationError);

  assert.equal(statusCode, 400);
  assert.equal(payload.error.code, "VALIDATION_ERROR");
  assert.equal(payload.error.message, "Request validation failed");
  assert.ok(Array.isArray(payload.error.issues));
});
