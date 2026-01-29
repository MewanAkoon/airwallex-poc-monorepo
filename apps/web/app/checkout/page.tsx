'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { CheckoutOrderSummary, AirwallexDropin } from '@/components/checkout';
import { getCheckoutSession, type CheckoutSession } from '@/hooks/useCheckout';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const intentId = searchParams.get('intent_id');
  const [session, setSession] = useState<CheckoutSession | null | undefined>(undefined);

  useEffect(() => {
    if (!intentId) {
      setSession(null);
      return;
    }
    const s = getCheckoutSession(intentId);
    setSession(s ?? null);
  }, [intentId]);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        </main>
      </div>
    );
  }

  if (!intentId || !session) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 text-amber-700">
                <AlertCircle className="h-8 w-8 shrink-0" />
                <CardTitle className="text-xl">Checkout session expired</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Your session may have expired or the link is invalid. Please return to your cart and
                proceed to checkout again.
              </p>
            </CardHeader>
            <CardContent>
              <Link href="/cart">
                <Button className="w-full" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cart
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <CheckoutOrderSummary session={session} />
          </div>
          <div>
            <AirwallexDropin intentId={intentId} session={session} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          </main>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
