import { useState } from 'react';
import { CartItem } from '@poc/shared';
import { init } from '@airwallex/components-sdk';
import { API_ENDPOINTS } from '@/lib/constants';
import { markCheckoutReturn } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { ShippingAddress } from '@/components/ShippingAddressForm';

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (cart: CartItem[], shippingAddress: ShippingAddress | null) => {
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
      await init({
        env: 'demo',
        enabledElements: ['payments'],
      });

      const response = await fetch(API_ENDPOINTS.PAYMENT_INTENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart, shippingAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const intent = await response.json();
      const { id, client_secret, currency } = intent;

      // Mark that we're going to checkout (for cart clearing on return)
      markCheckoutReturn();

      // Redirect to Hosted Checkout
      const { payments } = await init({
        env: 'demo',
        enabledElements: ['payments'],
      });

      payments?.redirectToCheckout({
        mode: 'payment',
        currency,
        intent_id: id,
        client_secret: client_secret,
        appearance: { mode: 'light' },
        successUrl: `${window.location.origin}/`,
      });
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
