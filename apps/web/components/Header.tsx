'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { BookOpen, ShoppingCart } from 'lucide-react';
import { Button } from '@/ui/button';
import { useState, useEffect } from 'react';

export function Header() {
  const { cart } = useCart();
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }, [cart]);

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">BookStore</h1>
          </Link>
          <Link href="/cart">
            <Button variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart {isClient && cartCount > 0 && `(${cartCount})`}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
