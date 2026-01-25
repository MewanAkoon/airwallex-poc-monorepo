export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  PRICING: `${BACKEND_URL}/payment-intent/pricing`,
  PAYMENT_INTENT: `${BACKEND_URL}/payment-intent`,
  SHIPPING: `${BACKEND_URL}/payment-intent/shipping`,
} as const;
