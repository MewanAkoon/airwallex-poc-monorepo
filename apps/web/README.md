# Frontend - Next.js

Next.js frontend for the bookstore POC.

## Setup

1. Install dependencies (from root):

```bash
pnpm install
```

2. Copy `.env.example` to `.env.local` and adjust if needed (e.g. `NEXT_PUBLIC_BACKEND_URL`).

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
pnpm start
```

## Formatting

```bash
pnpm format        # format app files
pnpm format:check  # check only (CI)
```

## Linting

```bash
pnpm lint
```

## Pages

- `/` - Home page with book browsing
- `/cart` - Shopping cart, address, pricing summary, and checkout
