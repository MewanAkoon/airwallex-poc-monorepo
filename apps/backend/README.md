# Backend - NestJS

NestJS backend for Airwallex payment integration, Quaderno tax calculation, and pricing/shipping.

## Setup

1. Install dependencies (from root):

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and configure Airwallex, Quaderno, and app settings.

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
pnpm start:prod
```

## Formatting

```bash
pnpm format        # format src
pnpm format:check  # check only (CI)
```

## Linting

```bash
pnpm lint
```

## API Endpoints

- `GET /` - Health check (returns `{ "status": "ok" }`)
- `POST /payment-intent/pricing` - Calculate pricing (subtotal, tax, shipping, total)
- `POST /payment-intent/shipping` - Calculate shipping cost
- `POST /payment-intent` - Create payment intent
- `POST /webhooks/airwallex` - Webhook endpoint

## Testing Webhooks with Ngrok

To receive Airwallex webhooks on your machine, expose the backend with [ngrok](https://ngrok.com).

### Install Ngrok

If ngrok is not installed:

- **macOS:** [Download / install guide](https://ngrok.com/download/mac-os) — or run `brew install ngrok`
- Configure your auth token: `ngrok config add-authtoken <token>` (get a token from [ngrok](https://ngrok.com))

### Run the tunnel

With the backend running on port 3001:

```bash
ngrok http 3001
```

You’ll see a public URL (e.g. `https://xxxx-xx-xx-xx-xx.ngrok-free.dev`). Use this as the base for your webhook URL.

### Bypass the ngrok interstitial (free accounts)

On free ngrok plans, the first visit shows a warning page. Open your ngrok URL in a browser, click **Visit Site** on that page once, then continue. Doing this once helps avoid issues when the webhook URL is called later.

### Update the webhook URL in Airwallex

1. In your [Airwallex](https://www.airwallex.com) account, go to **Developers → Webhooks** (or your project’s webhook settings).
2. Set the webhook URL to your ngrok URL plus the path:  
   `https://<your-ngrok-subdomain>.ngrok-free.dev/webhooks/airwallex`
3. Save. New events will be sent to this URL while the tunnel is running.

### Verify webhook signatures

When you create a webhook, Airwallex gives you a **webhook secret** (starts with `whsec_`). To verify that incoming webhooks are from Airwallex:

1. Set `AIRWALLEX_WEBHOOK_SECRET` in `.env` to that secret.
2. The backend will verify each request using the `x-timestamp` and `x-signature` headers (HMAC-SHA256 over timestamp + raw body). Invalid or missing signatures return `401 Unauthorized`.
3. If `AIRWALLEX_WEBHOOK_SECRET` is not set, webhook requests return `401 Unauthorized`.
