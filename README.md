# Airwallex Hosted Checkout - Turbo Monorepo POC

A proof of concept demonstrating Airwallex Hosted Checkout integration in a Turbo monorepo with Next.js frontend and NestJS backend.

## Prerequisites

- **Node.js**: v22.21.0 (specified in `.nvmrc`)
- **pnpm**: v10.22.0

### Installing Node.js

If you use `nvm`:
```bash
nvm install
nvm use
```

### Installing pnpm

```bash
npm install -g pnpm@10.22.0
```

## Setup

1. **Install dependencies**:
```bash
pnpm install
```

2. **Configure environment variables**:

Create `apps/backend/.env`:
```env
AIRWALLEX_CLIENT_ID=
AIRWALLEX_API_KEY=
AIRWALLEX_ENV=sandbox
AIRWALLEX_API_BASE_URL=https://demo-pacheckoutdemo.airwallex.com
FRONTEND_BASE_URL=http://localhost:3000
WEBHOOK_URL=http://localhost:3001/webhooks/airwallex
PORT=3001
```

Create `apps/web/.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

> **Note**: If `AIRWALLEX_CLIENT_ID` and `AIRWALLEX_API_KEY` are not provided, the backend will use the dummy API (no authentication required).

## Development

Run all apps:
```bash
pnpm dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Build

```bash
pnpm build
```

## Linting

```bash
pnpm lint
```
