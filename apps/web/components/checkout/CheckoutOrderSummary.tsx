'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { formatCurrency, Row } from './utils';
import type { CheckoutSession } from '@/hooks/useCheckout';
import { cn } from '@/lib/utils';

export interface CheckoutOrderSummaryProps {
  session: CheckoutSession;
}

export function CheckoutOrderSummary({ session }: CheckoutOrderSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const { cartItems, pricing, intent } = session;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl">Order summary</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(pricing.total)} {intent.currency}
            </span>
            <button
              type="button"
              className="lg:hidden p-1 rounded hover:bg-slate-100"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
            >
              <ChevronDown
                className={cn(
                  'h-5 w-5 text-slate-500 transition-transform',
                  expanded && 'rotate-180'
                )}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn('space-y-4', !expanded && 'hidden lg:block')}>
        <ul className="space-y-4">
          {cartItems.map((item) => {
            const lineTotal = item.book.price * item.quantity;
            return (
              <li
                key={item.book.id}
                className="flex gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0"
              >
                <div className="relative w-16 h-24 shrink-0 rounded-md overflow-hidden bg-slate-100">
                  <Image
                    src={item.book.imageUrl}
                    alt={item.book.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{item.book.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {pricing?.subtotal != null
                      ? `${formatCurrency(item.book.price)} × ${item.quantity}`
                      : `${item.book.price} USD × ${item.quantity}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-slate-900">{formatCurrency(lineTotal)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <Row label="Subtotal" value={pricing.subtotal} />
          <Row label="Shipping" value={pricing.shipping} />
          <Row
            label="Tax"
            value={pricing.tax}
            suffix={pricing.taxRate != null ? ` (${pricing.taxRate.toFixed(1)}%)` : undefined}
          />
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="font-semibold text-slate-900">Total to pay</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(pricing.total)} {intent.currency}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
