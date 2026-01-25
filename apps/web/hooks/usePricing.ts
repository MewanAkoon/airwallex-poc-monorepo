import { useState, useEffect } from 'react';
import { CartItem, PricingBreakdown } from '@poc/shared';
import { API_ENDPOINTS } from '@/lib/constants';

export function usePricing(cart: CartItem[], shippingAmount?: number) {
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      if (cart.length === 0) {
        setPricing(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.PRICING, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems: cart,
            shippingAmount: shippingAmount,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate pricing');
        }

        const pricingData = await response.json();
        setPricing(pricingData);
      } catch (err) {
        console.error('Error fetching pricing:', err);
        setError('Failed to calculate pricing');
        setPricing(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPricing();
  }, [cart, shippingAmount]);

  return { pricing, isLoading, error };
}
