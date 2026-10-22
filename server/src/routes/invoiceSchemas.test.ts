import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  invoicePatchSchema,
  invoiceReconciliationSchema,
} from "./schemas.js";

describe("invoice financial request schemas", () => {
  it("rejects status and M-Pesa reference changes through ordinary invoice edits", () => {
    assert.equal(invoicePatchSchema.safeParse({ status: "paid" }).success, false);
    assert.equal(invoicePatchSchema.safeParse({ status: "failed" }).success, false);
    assert.equal(invoicePatchSchema.safeParse({ mpesa_ref: "manual" }).success, false);
  });

  it("requires an attempt, meaningful reason, and evidence reference for reconciliation", () => {
    const valid = {
      attempt_id: "00000000-0000-4000-8000-000000000001",
      outcome: "paid",
      reason: "Matched the bank settlement statement to the invoice.",
      evidence_reference: "settlement-report-2026-10-22-row-14",
    };
    assert.equal(invoiceReconciliationSchema.safeParse(valid).success, true);
    assert.equal(
      invoiceReconciliationSchema.safeParse({ ...valid, evidence_reference: " " }).success,
      false,
    );
    assert.equal(
      invoiceReconciliationSchema.safeParse({ ...valid, reason: "ok" }).success,
      false,
    );
    assert.equal(
      invoiceReconciliationSchema.safeParse({ ...valid, actor_email: "attacker@example.com" }).success,
      false,
    );
  });
});
