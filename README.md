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

Copy `apps/backend/.env.example` to `apps/backend/.env` and set:

- **Airwallex** (optional): `AIRWALLEX_CLIENT_ID`, `AIRWALLEX_API_KEY`. If empty, the backend uses the dummy API (no authentication).
- **Quaderno** (optional): `QUADERNO_API_KEY`, `QUADERNO_API_BASE_URL`, `QUADERNO_FROM_COUNTRY`, `QUADERNO_FROM_POSTAL_CODE`. If `QUADERNO_API_KEY` is empty, a flat 10% tax fallback is used.
- **App**: `FRONTEND_BASE_URL`, `WEBHOOK_URL`, `PORT`.

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

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

## Formatting

Format the whole repo (Prettier):

```bash
pnpm format
```

Check formatting without writing (for CI):

```bash
pnpm format:check
```

You can also run `format` or `format:check` in individual workspaces, e.g. `pnpm --filter @poc/backend format:check`.

## CI

Run format check, lint, and build:

```bash
pnpm ci:check
```
