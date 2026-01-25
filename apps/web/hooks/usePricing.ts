import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CartItem, PricingBreakdown } from '@poc/shared';
import { API_ENDPOINTS } from '@/lib/constants';
import { ShippingAddress } from '@/components/ShippingAddressForm';

/**
 * Fetches pricing (subtotal, tax, shipping, total) from the backend. Only runs
 * after the user enters their shipping address. Backend calls Quaderno for tax
 * and calculateShipping for shipping (random for now).
 */
export function usePricing(cart: CartItem[], shippingAddress: ShippingAddress | null) {
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      if (cart.length === 0 || !shippingAddress) {
        setPricing(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.PRICING, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems: cart, shippingAddress }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const message =
            (typeof body?.error === 'string' && body.error) ||
            (typeof body?.message === 'string' && body.message) ||
            'Failed to calculate pricing';
          throw new Error(message);
        }

        const pricingData = await response.json();
        setPricing(pricingData);
        toast.success('Tax and total calculated for your location.');
      } catch (err) {
        console.error('Error fetching pricing:', err);
        const message = err instanceof Error ? err.message : 'Failed to calculate pricing';
        setError(message);
        setPricing(null);
        toast.error(
          "We couldn't calculate tax and shipping for your address. Please check your address and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, [cart, shippingAddress]);

  return { pricing, isLoading, error };
}
