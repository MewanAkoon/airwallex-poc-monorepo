'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { init, createElement } from '@airwallex/components-sdk';
import { clearCheckoutSession, type CheckoutSession } from '@/hooks/useCheckout';
import { useCart } from '@/contexts/CartContext';
import { getAirwallexEnv } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Loader2 } from 'lucide-react';

const DROPIN_CONTAINER_ID = 'airwallex-dropin-container';

export interface AirwallexDropinProps {
  intentId: string;
  session: CheckoutSession;
}

export function AirwallexDropin({ intentId, session }: AirwallexDropinProps) {
  const router = useRouter();
  const { clearCart } = useCart();
  const [dropinReady, setDropinReady] = useState(false);
  const [dropinError, setDropinError] = useState<string | null>(null);
  const dropinRef =
    useRef<ReturnType<typeof createElement> extends Promise<infer T> ? T : unknown>(null);
  const fallbackReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!intentId || !session?.intent) return;

    const intentData = session.intent;
    let mounted = true;
    const container = document.getElementById(DROPIN_CONTAINER_ID);

    // Listen for CustomEvents on the container (same pattern as Airwallex demo: addEventListener on the div, not element.on())
    const onReady = (_event: Event) => {
      if (mounted) setDropinReady(true);
    };
    const onSuccess = (_event: Event) => {
      clearCheckoutSession(intentId);
      clearCart();
      router.replace('/checkout/success');
    };
    const onError = (event: Event) => {
      const customEvent = event as CustomEvent<{ error?: { message?: string } }>;
      const message = customEvent.detail?.error?.message ?? 'Payment error';
      if (mounted) setDropinError(message);
    };

    container?.addEventListener('onReady', onReady);
    container?.addEventListener('onSuccess', onSuccess);
    container?.addEventListener('onError', onError);

    const setupDropin = async () => {
      try {
        await init({
          env: getAirwallexEnv(),
          locale: 'en',
          enabledElements: ['payments'],
        });

        if (!mounted) return;

        const element = await createElement('dropIn', {
          intent_id: intentData.id,
          client_secret: intentData.client_secret,
          currency: intentData.currency,
          appearance: {
            mode: 'light',
            variables: {
              colorBrand: '#612FFF',
              colorText: '#14171a',
              colorBackground: '#ffffff',
            },
          },
        });

        if (!mounted) {
          element?.destroy?.();
          return;
        }

        (dropinRef as React.MutableRefObject<unknown>).current = element;

        // Mount to container by id (must match the div id so SDK can dispatch CustomEvents on it)
        const mountTarget = document.getElementById(DROPIN_CONTAINER_ID);
        if (mountTarget) {
          element?.mount?.(mountTarget);
          fallbackReadyTimeoutRef.current = setTimeout(() => {
            if (mounted) setDropinReady(true);
          }, 500);
        }
      } catch (err: unknown) {
        if (mounted) {
          setDropinError(err instanceof Error ? err.message : 'Failed to load payment form');
        }
      }
    };

    setupDropin();

    return () => {
      mounted = false;
      container?.removeEventListener('onReady', onReady);
      container?.removeEventListener('onSuccess', onSuccess);
      container?.removeEventListener('onError', onError);
      if (fallbackReadyTimeoutRef.current) {
        clearTimeout(fallbackReadyTimeoutRef.current);
        fallbackReadyTimeoutRef.current = null;
      }
      const el = (
        dropinRef as React.MutableRefObject<{ destroy?: () => void; unmount?: () => void } | null>
      ).current;
      if (el?.unmount) el.unmount();
      if (el?.destroy) el.destroy();
      (dropinRef as React.MutableRefObject<unknown>).current = null;
      setDropinReady(false);
    };
    // intentId + session?.intent?.id only (session read from closure); including session would re-run on every session ref change and remount the drop-in
    // eslint-disable-next-line react-hooks/exhaustive-deps -- session used inside effect; we depend on session?.intent?.id only
  }, [intentId, session?.intent?.id, clearCart, router]);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Select payment method</CardTitle>
      </CardHeader>
      <CardContent>
        {dropinError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-800 text-sm">{dropinError}</div>
        )}
        {!dropinReady && !dropinError && (
          <div className="flex items-center gap-2 text-slate-500 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading payment form…</span>
          </div>
        )}
        <div
          id={DROPIN_CONTAINER_ID}
          className="min-h-[200px]"
          aria-label="Airwallex payment form"
        />
      </CardContent>
    </Card>
  );
}
