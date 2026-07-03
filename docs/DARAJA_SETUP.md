# Daraja Setup

## Part A - For The Business Owner

### What is Daraja?

Daraja is Safaricom's system that lets websites send M-Pesa payment requests. When a client pays an invoice on your website, Daraja sends the STK Push prompt to their phone. After they pay, Daraja tells the website and the invoice is marked as paid.

### What you need to do

You need a Safaricom business account with a Paybill or Till number. Your developer handles the technical setup. You provide the Paybill or Till details and approve any Safaricom account steps.

### What your developer needs from you

- M-Pesa Paybill or Till number
- Access to the Safaricom Daraja developer portal, or permission to create the app for you

## Part B - For The Developer

### Step 1 - Create a Daraja developer account

1. Go to [https://developer.safaricom.co.ke](https://developer.safaricom.co.ke).
2. Register and verify your email.
3. Log in to the developer portal.

### Step 2 - Create an app

1. Open My Apps.
2. Add a new app named `Malume Photography`.
3. Select Lipa Na M-Pesa Online.
4. Save the app.
5. Copy the Consumer Key and Consumer Secret.

### Step 3 - Test in sandbox first

Use sandbox mode before production:

```env
DARAJA_ENV=sandbox
```

Use Safaricom's sandbox test values from the developer portal.

### Step 4 - Collect production credentials

Production requires:

- Shortcode: Paybill or Till number
- Passkey: provided by Safaricom
- Consumer Key: from the production Daraja app
- Consumer Secret: from the production Daraja app

### Step 5 - Add environment variables

Add these to `server/.env` locally or Railway in production:

```env
DARAJA_ENV=sandbox
DARAJA_CONSUMER_KEY=your-consumer-key
DARAJA_CONSUMER_SECRET=your-consumer-secret
DARAJA_SHORTCODE=your-paybill-or-till
DARAJA_PASSKEY=your-passkey
DARAJA_CALLBACK_URL=https://your-api-domain.railway.app/webhooks/daraja
```

`DARAJA_CALLBACK_URL` must be a public HTTPS URL. It cannot be `localhost`.

### Step 6 - Test the sandbox flow

1. Start the backend.
2. Create a test invoice in the admin dashboard.
3. Open the public invoice lookup page.
4. Enter the invoice number and a Safaricom sandbox test phone.
5. Trigger payment.
6. Confirm the API receives or can simulate the Daraja callback.
7. Confirm the invoice status changes to `paid`.

### Step 7 - Go live

1. Deploy the backend to Railway.
2. Set `DARAJA_CALLBACK_URL` to the Railway backend URL ending in `/webhooks/daraja`.
3. Change `DARAJA_ENV=production`.
4. Add production Consumer Key, Consumer Secret, Passkey, and Shortcode.
5. Test with a real KSh 1 payment before sending invoices to clients.

### Webhook security

The `/webhooks/daraja` endpoint validates incoming payload shape before updating invoices. Keep all Daraja secrets in environment variables only.
