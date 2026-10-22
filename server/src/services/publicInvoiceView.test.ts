import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toPublicInvoiceView } from "./publicInvoiceView.js";

describe("public invoice response projection", () => {
  it("omits customer contact, payment reference, and internal line-item metadata", () => {
    const view = toPublicInvoiceView({
      id: "invoice-uuid",
      invoice_no: "INV-20261021-ABCDE",
      client_name: "Private Customer",
      phone: "+254712345678",
      amount: "100.00",
      status: "unpaid",
      mpesa_ref: "private-payment-reference",
      paid_at: null,
      line_items: [
        {
          id: "line-item-uuid",
          invoice_id: "invoice-uuid",
          description: "Portrait session",
          quantity: 1,
          unit_price: "100.00",
          created_at: "2026-10-21T00:00:00.000Z",
        },
      ],
    });

    assert.deepEqual(view, {
      id: "invoice-uuid",
      invoice_no: "INV-20261021-ABCDE",
      amount: "100.00",
      status: "unpaid",
      line_items: [
        { description: "Portrait session", quantity: 1, unit_price: "100.00" },
      ],
    });
    assert.equal("phone" in view, false);
    assert.equal("client_name" in view, false);
    assert.equal("mpesa_ref" in view, false);
  });
});
