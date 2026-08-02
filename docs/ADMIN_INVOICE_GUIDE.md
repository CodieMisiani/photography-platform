# Admin Invoice Guide

## 1. What The Invoice System Does

The admin creates an invoice listing the work and the KSh amounts. The client receives a link, opens it, sees the itemised breakdown, and enters their M-Pesa number. Safaricom sends a payment prompt to their phone. After the client enters their PIN, the system automatically marks the invoice Paid and stores the M-Pesa receipt number.

## 2. How To Create An Invoice

1. Log in at `[your website]/admin/login`.
2. Click **Invoices** in the sidebar.
3. Click **Create Invoice**.
4. Fill in **Client Name** and **Phone Number**, for example `+254 7XX XXX XXX`.
5. Click **Add Line** for each service:
   - Description, for example `Wedding Photography - Full Day`
   - Quantity, usually `1`
   - Unit Price in KSh
   - Total is calculated automatically by the system
6. Click **Save Invoice** or **Generate Invoice**.
7. An invoice number is generated automatically, for example `INV-20260802-ABCDE`.

## 3. How To Share With A Client

Copy the link `[your website]/invoice/INV-20260802-ABCDE` or open `[your website]/pay-invoice` and share the invoice number. Send it by WhatsApp, email, or SMS. The client does not need to log in.

## 4. What The Client Sees And Does

The client opens the invoice page, sees the itemised KSh breakdown, enters their M-Pesa number, and clicks **Pay with M-Pesa** or **Send STK Push**. Their phone receives a Safaricom STK prompt. They enter their PIN. The page updates after the backend receives the Daraja callback.

## 5. How To Know When A Client Has Paid

Open **Admin -> Invoices**. A Paid badge means the payment was completed and confirmed by the backend. Open or inspect the invoice details to see the M-Pesa reference and payment timestamp. You may also receive the standard Safaricom payment SMS on the registered business line.

## 6. If A Client Says They Paid But The Invoice Shows Unpaid

1. Ask the client for their M-Pesa confirmation SMS. It contains a receipt number such as `QKL0000001`.
2. Contact the developer with the receipt number, invoice number, and approximate payment time.
3. The developer verifies the payment against Safaricom records or backend logs.
4. Do not mark an invoice Paid unless the M-Pesa receipt is confirmed.

## 7. Editing And Deleting Invoices

- **Before payment:** use **Edit** to update client details or line items.
- **After payment:** avoid changing paid invoices so the payment record stays accurate.
- **Delete:** only delete unpaid invoices created by mistake.

## 8. Invoice Numbering

Invoice numbers are generated automatically in the format `INV-YYYYMMDD-ABCDE`. They should not be changed manually because consistent numbering keeps the records easier to audit.
