# Testing Daraja STK Push

## 1. What You Are Testing

This test confirms the full invoice payment journey. A client opens an invoice link, sees the itemised KSh breakdown, enters their M-Pesa number, and clicks Pay. Safaricom sends an STK prompt to the client's phone, the client enters their PIN, and Daraja calls the backend webhook. The backend then updates the invoice status and stores the M-Pesa receipt number when payment succeeds.

## 2. Prerequisites Checklist

```text
[ ] server/.env contains: DARAJA_CONSUMER_KEY, DARAJA_CONSUMER_SECRET,
    DARAJA_PASSKEY, DARAJA_SHORTCODE, DARAJA_CALLBACK_URL, DARAJA_ENV
[ ] Backend running: npm run dev (in server/)
[ ] Frontend running: npm run dev (in client/)
[ ] GET /health returns: { postgres: "ok", redis: "ok" }
[ ] Safaricom SIM available for production testing
[ ] For sandbox: sandbox credentials from developer.safaricom.co.ke
[ ] For production: DARAJA_ENV=production and live Paybill credentials set
```

## 3. Sandbox Test

### Step 1 - Create A Test Invoice

Log in to the admin dashboard, open **Invoices**, and create an invoice:

- Client Name: `Test Client`
- Phone: `+254712345678`
- Line item: `Photography Session`, quantity `1`, unit price `100`

Save the invoice and note the generated invoice number, for example `INV-20260802-ABCDE`.

### Step 2 - Trigger The STK Push

Open the public invoice payment page, enter the invoice number, and confirm the KSh 100 breakdown appears. Enter the sandbox test MSISDN `254708374149`, click **Pay with M-Pesa** or **Send STK Push**, then check the backend terminal for:

```text
[Daraja] STK Push initiated -> CheckoutRequestID: ws_CO_xxx
```

### Step 3 - Simulate The Daraja Callback

The Daraja webhook is registered in `server/src/routes/invoiceRoutes.ts` as `POST /webhooks/daraja`. The handler calls `applyDarajaCallback` in `server/src/services/invoiceService.ts`, which expects `Body.stkCallback.CheckoutRequestID`, `ResultCode`, and optional `CallbackMetadata.Item`.

Replace `[copy from backend log in Step 2]` with the CheckoutRequestID from your backend log:

```bash
curl -X POST http://localhost:4000/webhooks/daraja \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-id",
        "CheckoutRequestID": "[copy from backend log in Step 2]",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            { "Name": "Amount", "Value": 100 },
            { "Name": "MpesaReceiptNumber", "Value": "TEST000001" },
            { "Name": "TransactionDate", "Value": 20240101120000 },
            { "Name": "PhoneNumber", "Value": 254708374149 }
          ]
        }
      }
    }
  }'
```

### Step 4 - Verify Success

Open the admin invoice list and confirm the invoice status is **Paid** and the receipt is `TEST000001`. Open the public invoice page again and confirm it shows the paid state.

### Step 5 - Test Cancelled Payment

Trigger a new STK push for an unpaid invoice, then simulate a cancellation:

```bash
curl -X POST http://localhost:4000/webhooks/daraja \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-id",
        "CheckoutRequestID": "[copy from backend log in Step 2]",
        "ResultCode": 1032,
        "ResultDesc": "Request cancelled by user."
      }
    }
  }'
```

Current application behavior: the invoice is marked **Failed**, and the frontend shows a clear failure state instead of spinning forever.

### Step 6 - Test Timeout

Trigger a push and send no callback. Wait for the frontend polling timeout. Expected result: the frontend shows that payment was not completed and lets the client try again.

## 4. Production Test

1. Set `DARAJA_ENV=production` on Railway or Render.
2. Set `DARAJA_CALLBACK_URL=https://your-api-domain/webhooks/daraja`.
3. Create an invoice for KSh 1.
4. Enter a real Safaricom number you control.
5. The STK prompt should appear within 5-10 seconds.
6. Enter the PIN and confirm the invoice is marked Paid with the receipt stored.

Phone numbers must be `2547XXXXXXXX`: no `+`, no leading `0`.

| Symptom | Likely Cause | Fix |
|---|---|---|
| No prompt on phone | `DARAJA_CALLBACK_URL` is not publicly reachable | Deploy the backend first and use the public URL |
| `invalid access token` | Wrong consumer key or secret | Re-copy from the Daraja portal |
| `Bad Request - Invalid Initiator Information` | Wrong passkey | Re-copy the passkey |
| Amount error | Invoice total is below KSh 1 | Fix invoice validation or create a valid invoice |
| Invoice not updating after payment | Webhook not received | Check backend logs for `POST /webhooks/daraja` |
| `ResultCode: 1` after paying | Wrong production shortcode | Confirm shortcode with Safaricom |

## 5. Expected Backend Log Output

These log statements are present in `server/src/services/invoiceService.ts`.

Success flow:

```text
[Daraja] STK Push initiated -> CheckoutRequestID: ws_CO_xxx
[Daraja] Webhook received -> ResultCode: 0
[Daraja] Invoice INV-20260802-ABCDE marked PAID -> MpesaRef: QKL0000001
```

Failure flow:

```text
[Daraja] STK Push initiated -> CheckoutRequestID: ws_CO_xxx
[Daraja] Webhook received -> ResultCode: 1032 (Request cancelled by user)
[Daraja] Invoice INV-20260802-ABCDE marked FAILED -> CheckoutRequestID: ws_CO_xxx
```

## 6. Troubleshooting Notes

- If `/health` fails, fix Postgres or Redis before testing payments.
- If the invoice lookup fails, confirm the invoice number exists in the admin invoice list.
- If the webhook returns `INVOICE_PAYMENT_NOT_FOUND`, the callback CheckoutRequestID does not match the invoice `mpesa_ref`.
- If Daraja credentials are missing, the backend cannot request an access token.
- Never commit Daraja credentials to Git.
