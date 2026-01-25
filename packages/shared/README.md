# Shared Package

Shared TypeScript types and constants used across the monorepo.

## Types

- `Book` - Book entity
- `CartItem` - Cart item with book and quantity
- `PricingBreakdown` - Pricing calculation result (subtotal, tax, shipping, total, taxRate)

## Constants

- `TAX_RATE` - Tax rate (0.10 = 10%)
- `SHIPPING_AMOUNT` - Default shipping amount (5.00)

## Build

```bash
pnpm build
```

## Formatting

```bash
pnpm format        # format src
pnpm format:check  # check only (CI)
```
