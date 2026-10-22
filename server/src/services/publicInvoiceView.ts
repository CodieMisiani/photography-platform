import type { InvoiceLineItemRow, InvoiceRow } from "../types/domain.js";

export type PublicInvoiceView = Pick<
  InvoiceRow,
  "id" | "invoice_no" | "amount" | "status"
> & {
  line_items: Array<Pick<InvoiceLineItemRow, "description" | "quantity" | "unit_price">>;
};

/** Return only the fields required by the public invoice/payment flow. */
export function toPublicInvoiceView(
  invoice: InvoiceRow & { line_items: InvoiceLineItemRow[] },
): PublicInvoiceView {
  return {
    id: invoice.id,
    invoice_no: invoice.invoice_no,
    amount: invoice.amount,
    status: invoice.status,
    line_items: invoice.line_items.map(({ description, quantity, unit_price }) => ({
      description,
      quantity,
      unit_price,
    })),
  };
}
