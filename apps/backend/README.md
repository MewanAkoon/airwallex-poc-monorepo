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

- `POST /payment-intent/pricing` - Calculate pricing (subtotal, tax, shipping, total)
- `POST /payment-intent/shipping` - Calculate shipping cost
- `POST /payment-intent` - Create payment intent
- `POST /webhooks/airwallex` - Webhook endpoint
