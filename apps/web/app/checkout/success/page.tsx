'use client';

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Thanks for your order!</h1>
        <p className="text-slate-600 mb-8">Your payment is complete.</p>
        <Link href="/">
          <Button
            variant="outline"
            size="lg"
            className="border-slate-300 text-[#612FFF] hover:bg-slate-50 hover:text-[#612FFF]"
          >
            Back to home
          </Button>
        </Link>
      </main>
    </div>
  );
}
