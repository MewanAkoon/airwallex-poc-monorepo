import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartItem, PricingBreakdown } from '@poc/shared';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { ShippingAddress } from '@/components/ShippingAddressForm';

const CHECKOUT_SESSION_KEY = 'checkout_session';

export interface CheckoutSession {
  intent: { id: string; client_secret: string; currency: string; amount: number };
  cartItems: CartItem[];
  pricing: { subtotal: number; shipping: number; tax: number; total: number; taxRate?: number };
}

export function useCheckout() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (
    cart: CartItem[],
    shippingAddress: ShippingAddress | null,
    cartPricing?: PricingBreakdown | null
  ) => {
    if (cart.length === 0) {
      toast.error('Cart is empty', {
        description: 'Please add items to your cart before checkout.',
      });
      return;
    }

    if (!shippingAddress) {
      toast.error('Shipping address required', {
        description: 'Please provide your shipping address before checkout.',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const body: {
        cartItems: CartItem[];
        shippingAddress: ShippingAddress;
        pricing?: PricingBreakdown;
      } = {
        cartItems: cart,
        shippingAddress,
      };
      if (cartPricing != null) body.pricing = cartPricing;

      const response = await fetch(API_ENDPOINTS.PAYMENT_INTENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      const { id, client_secret, currency, amount, cartItems, pricing } = data;

      const session: CheckoutSession = {
        intent: { id, client_secret, currency, amount },
        cartItems: cartItems ?? cart,
        pricing: pricing ?? {
          subtotal: cart.reduce((s, i) => s + i.book.price * i.quantity, 0),
          shipping: 0,
          tax: 0,
          total: amount,
        },
      };

      sessionStorage.setItem(`${CHECKOUT_SESSION_KEY}_${id}`, JSON.stringify(session));
      router.replace(`/checkout?intent_id=${encodeURIComponent(id)}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('Checkout failed', {
        description: err?.message || 'An error occurred during checkout. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  return { handleCheckout, isProcessing };
}

export function getCheckoutSession(intentId: string): CheckoutSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(`${CHECKOUT_SESSION_KEY}_${intentId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutSession;
  } catch {
    return null;
  }
}

export function clearCheckoutSession(intentId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`${CHECKOUT_SESSION_KEY}_${intentId}`);
}
