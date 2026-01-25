'use client';

import { PricingBreakdown } from '@poc/shared';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { Loader2, CreditCard } from 'lucide-react';

interface PricingSummaryProps {
  pricing: PricingBreakdown | null;
  isLoading: boolean;
  onCheckout: () => void;
  isProcessing: boolean;
  hasShippingAddress: boolean;
  shippingAmount?: number;
}

export function PricingSummary({
  pricing,
  isLoading,
  onCheckout,
  isProcessing,
  hasShippingAddress,
  shippingAmount,
}: PricingSummaryProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>Review your order details</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Calculating pricing...</p>
          </div>
        ) : pricing ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%):</span>
              <span className="font-medium">${pricing.tax.toFixed(2)}</span>
            </div>
            {shippingAmount !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-medium">${shippingAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onCheckout}
          disabled={isProcessing || isLoading || !pricing || !hasShippingAddress}
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
