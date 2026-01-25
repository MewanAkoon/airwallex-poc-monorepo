'use client';

import { CartItem, PricingBreakdown } from '@poc/shared';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { Loader2, CreditCard } from 'lucide-react';

function subtotalFromCart(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
}

interface PricingSummaryProps {
  cart: CartItem[];
  pricing: PricingBreakdown | null;
  isLoading: boolean;
  onCheckout: () => void;
  isProcessing: boolean;
  hasShippingAddress: boolean;
}

export function PricingSummary({
  cart,
  pricing,
  isLoading,
  onCheckout,
  isProcessing,
  hasShippingAddress,
}: PricingSummaryProps) {
  const subtotal = pricing != null ? pricing.subtotal : subtotalFromCart(cart);
  const total = pricing != null ? pricing.total : subtotal;

  const shippingLabel =
    pricing != null
      ? `$${pricing.shipping.toFixed(2)}`
      : isLoading
        ? 'Calculating...'
        : 'Not calculated yet';

  const taxLabel =
    pricing != null
      ? `$${pricing.tax.toFixed(2)}${pricing.taxRate != null ? ` (${pricing.taxRate.toFixed(1)}%)` : ''}`
      : isLoading
        ? 'Calculating...'
        : 'Not calculated yet';

  const canCheckout = hasShippingAddress && pricing != null && !isLoading && !isProcessing;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your order details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping:</span>
            <span className={pricing != null ? 'font-medium' : 'text-muted-foreground'}>
              {shippingLabel}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax:</span>
            <span className={pricing != null ? 'font-medium' : 'text-muted-foreground'}>
              {taxLabel}
            </span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onCheckout}
          disabled={!canCheckout}
          className="w-full"
          size="lg"
          aria-label="Proceed to checkout"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Checkout
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
