# Daraja Setup and Payment Safety

## Current behavior

Development and test default to the Safaricom sandbox; set `DARAJA_ENV=sandbox` explicitly in local and CI configuration. Only `sandbox` and `production` are accepted. A production server must explicitly set `DARAJA_ENV`; a missing production value is a startup error. Selecting production outside `NODE_ENV=production`, or enabling production approval in any other environment, also fails startup.

`DARAJA_PRODUCTION_INITIATION_ENABLED` defaults to `false`. With `DARAJA_ENV=production`, STK initiation fails with `DARAJA_INITIATION_DISABLED` before reserving an attempt unless the flag is explicitly set to `true` in `NODE_ENV=production`. Enabling it also requires non-empty credentials and a valid HTTPS callback URL at startup. In sandbox, missing credentials or a malformed callback URL blocks initiation before an attempt is reserved. Invalid enum/boolean values and contradictory production settings fail configuration validation; they never fall back to another provider host.

**Automatic payment settlement is disabled.** `server/src/services/invoiceService.ts` configures callback verification to return no verified result. A callback is acknowledged, but it cannot mark an invoice paid or failed and cannot trigger a paid notification. Do not use simulated callback payloads as evidence of payment. The checkout ID or a claimed receipt in a callback is not independent proof.

Existing invoice records with an `mpesa_ref` are migrated as `legacy_unverified`; historical values may be checkout IDs or receipts. An unresolved or ambiguous attempt prevents another prompt. Authenticated admins can inspect attempt history and resolve an attempt only through the separate audited reconciliation endpoint with a reason and trusted evidence reference. This manual decision is distinct from provider verification; audit events are append-only and status/attempt/audit updates are transactional. See [Admin Invoice Guide](ADMIN_INVOICE_GUIDE.md).

## Environment configuration

Use only the Safaricom sandbox while developing:

```env
DARAJA_ENV=sandbox
DARAJA_PRODUCTION_INITIATION_ENABLED=false
DARAJA_CONSUMER_KEY=your-sandbox-consumer-key
DARAJA_CONSUMER_SECRET=your-sandbox-consumer-secret
DARAJA_PASSKEY=your-sandbox-passkey
DARAJA_SHORTCODE=your-sandbox-shortcode
DARAJA_CALLBACK_URL=https://your-public-test-api.example.com/webhooks/daraja
```

Set real secrets only in an approved local secret store or deployment secret settings. The callback URL must be publicly reachable over HTTPS for Safaricom callbacks. Never paste credentials into docs, logs, tickets or source control.

Setting `DARAJA_ENV=production` selects Safaricom's live host, but initiation remains blocked by default. Setting `DARAJA_PRODUCTION_INITIATION_ENABLED=true` is an explicit activation switch and can prompt a real customer to pay. Do not enable it or provide production credentials: callback verification is still disabled, so the app cannot confirm settlement. Production activation requires owner approval, provider verification, independent review, audited reconciliation, and the readiness checklist below.

## Settlement prerequisites

Before enabling automatic settlement, implement and test a Safaricom-supported verification procedure that:

1. Resolves the exact persisted payment attempt and its checkout request.
2. Independently establishes provider transaction status; callback claims alone do not qualify.
3. Checks the verified amount and currency against the persisted expected amount and invoice.
4. Records a provider receipt only after verification and enforces receipt uniqueness.
5. Processes duplicate, concurrent, delayed, failed, and conflicting outcomes idempotently.
6. Sends notifications only after a durable verified transition and prevents duplicate sends.
7. Produces redacted operational diagnostics and an auditable manual reconciliation path.

Do not invent a Daraja endpoint, callback signature, or credential type. Confirm the supported verification method and account prerequisites with Safaricom/Daraja documentation and the business account owner. No verification call or payment was performed as part of this repository review.

## Safe sandbox validation

Automated tests must mock provider responses and must never initiate real transactions. A sandbox request may only be made from a specifically identified sandbox environment with approved sandbox credentials and a test phone. Do not test against a live shortcode, production credentials, or customer invoice. See [Testing Daraja](TESTING_DARAJA.md) and the [project readiness checklist](PROJECT_STATUS.md).
