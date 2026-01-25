# Backend - NestJS

NestJS backend for Airwallex payment integration.

## Setup

1. Install dependencies (from root):

```bash
pnpm install
```

2. Create `.env` file:

```env
AIRWALLEX_CLIENT_ID=
AIRWALLEX_API_KEY=
AIRWALLEX_ENV=sandbox
AIRWALLEX_API_BASE_URL=https://demo-pacheckoutdemo.airwallex.com
FRONTEND_BASE_URL=http://localhost:3000
WEBHOOK_URL=http://localhost:3001/webhooks/airwallex
PORT=3001
```

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
pnpm start:prod
```

## API Endpoints

- `POST /payment-intent/pricing` - Calculate pricing breakdown
- `POST /payment-intent/calculate-shipping` - Calculate shipping cost
- `POST /payment-intent` - Create payment intent
- `POST /webhooks/airwallex` - Webhook endpoint
