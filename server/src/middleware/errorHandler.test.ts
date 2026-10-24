import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { Request, Response } from "express";
import { z } from "zod";
import { createErrorHandler } from "./errorHandler.js";
import { AppError } from "../utils/AppError.js";

type CapturedResponse = {
  statusCode: number;
  body: unknown;
};

function dispatchError(error: unknown, production = true): CapturedResponse {
  const captured: CapturedResponse = { statusCode: 0, body: undefined };
  const response = {
    status(statusCode: number) {
      captured.statusCode = statusCode;
      return this;
    },
    json(body: unknown) {
      captured.body = body;
      return this;
    },
  } as unknown as Response;

  createErrorHandler(production)(
    error,
    {} as Request,
    response,
    () => undefined,
  );
  return captured;
}

const originalConsoleError = console.error;
afterEach(() => {
  console.error = originalConsoleError;
});

describe("production error responses", () => {
  it("does not expose an unexpected error message or stack", () => {
    const logs: unknown[][] = [];
    console.error = (...args: unknown[]) => logs.push(args);

    const result = dispatchError(new Error("database password: confidential"));

    assert.equal(result.statusCode, 500);
    assert.deepEqual(result.body, {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      },
    });
    assert.equal(JSON.stringify(logs).includes("confidential"), false);
  });

  it("retains intentional application error contracts", () => {
    const result = dispatchError(
      new AppError(409, "Already paid", "INVOICE_ALREADY_PAID"),
    );

    assert.equal(result.statusCode, 409);
    assert.deepEqual(result.body, {
      error: { code: "INVOICE_ALREADY_PAID", message: "Already paid" },
    });
  });

  it("retains validation error contracts", () => {
    let validationError: unknown;
    try {
      z.string().parse(42);
    } catch (error) {
      validationError = error;
    }

    const result = dispatchError(validationError);
    const body = result.body as {
      error: { code: string; message: string; issues: unknown[] };
    };
    assert.equal(result.statusCode, 400);
    assert.equal(body.error.code, "VALIDATION_ERROR");
    assert.equal(body.error.message, "Request validation failed");
    assert.equal(Array.isArray(body.error.issues), true);
  });
});
