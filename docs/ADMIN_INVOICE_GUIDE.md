# Admin Invoice Guide

## Current status

The admin can create, edit, list and delete invoices. A customer can look up an invoice, see its billed line items and amount, and request an M-Pesa STK Push. Payment attempts are persisted separately from invoices.

**A callback does not mark an invoice paid.** Independent Daraja verification is not implemented. The customer-facing page may remain pending or ask the customer to contact the studio to reconcile an uncertain attempt. Do not tell a customer that the site confirmed payment solely because an STK prompt appeared or a callback arrived.

Ordinary invoice edits may change customer contact details. Financial status and `mpesa_ref` cannot be changed through the generic edit API. Amount, invoice number, and billed line items are frozen once payment evidence or an attempt exists. The authenticated admin API provides a separate reconciliation action requiring an eligible unresolved attempt, a meaningful reason, and a trusted evidence reference. The acting email is taken from the admin session. The status change, attempt resolution, and append-only audit record commit atomically. This records an explicit manual decision; it is not provider verification.

## Create and share an invoice

1. Sign in at `/admin/login` and open **Invoices**.
2. Choose **Create Invoice**, enter the customer details and line items, then generate the invoice.
3. Share the invoice URL `/invoice/<invoice number>` or the `/pay-invoice` route and invoice number through the usual private channel.
4. The public page exposes only the invoice number, amount, payment state and billed line items needed for payment. It does not return the customer's contact details or M-Pesa reference.

## M-Pesa prompt and uncertain state

The customer enters a Safaricom number and requests an STK Push. Before the provider HTTP call, the attempt moves from `initiating` to durable `dispatching`. Reconciliation rejects `dispatching` because the request may still be in flight. If the request outcome is uncertain, checkout metadata cannot be saved, or a response is lost, the attempt remains quarantined and the page instructs the customer not to request another prompt and to contact the studio. A retry reuses/blocks any active attempt.

Do not resolve uncertainty by submitting a fake callback. Do not mark an invoice paid based on a callback body, checkout ID, customer screenshot, or unverified receipt claim. The reconciliation API and immutable audit are implemented, but operator policy, evidence standards, and any admin UI remain open. Manual reconciliation cannot prove provider verification. See [Daraja setup](DARAJA_SETUP.md) and [project status](PROJECT_STATUS.md).

## Editing and deletion

Invoice amount, invoice number, and billed line item changes are rejected after any payment attempt or legacy reference exists. Customer contact details remain editable. An invoice can be deleted only while unpaid and without any attempt or M-Pesa reference. Attempt history and reconciliation evidence are protected by restrictive foreign keys; an attempt reservation and invoice deletion serialize on the invoice row. Rejected deletes return a conflict and retain the record for audit.

To review payment history, use the authenticated `GET /admin/invoices/:id/payment-history` endpoint. To reconcile an attempt, use `POST /admin/invoices/:id/reconcile` with `attempt_id`, `outcome` (`paid` or `failed`), `reason`, and `evidence_reference`. The route requires the existing admin session, allowed Origin, and session-bound CSRF token. There is no customer-facing or automatic reconciliation workflow. Only reconcile after checking trusted business evidence through the studio's approved operational process. Callbacks remain unable to settle invoices because the verifier returns no verified result.

Migrations 014–017 establish the attempt and reconciliation ledger, add the `dispatching` enum label in its own committed migration, and then update the active-attempt index in a later migration. Migration 015 uses a text comparison for its new enum outcome constraint to remain safe within PostgreSQL's migration transaction. These financial-history migrations are forward-only: rollback is explicitly rejected even when tables appear empty, because manual rollback can destroy or orphan historical evidence and PostgreSQL cannot safely remove enum labels. Recovery requires an approved backup restore or a reviewed corrective forward migration. Migration history is local-only until the owner verifies the deployed migration record; no hosted database inspection was performed. A retention/deletion policy for invoice and inquiry data is still needed.
