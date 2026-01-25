'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { CartItem } from '@/components/CartItem';
import { PricingSummary } from '@/components/PricingSummary';
import { ShippingAddressForm, ShippingAddress } from '@/components/ShippingAddressForm';
import { useCart } from '@/contexts/CartContext';
import { usePricing } from '@/hooks/usePricing';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/ui/button';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/lib/constants';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [shippingAmount, setShippingAmount] = useState<number | undefined>(undefined);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const { pricing, isLoading: isLoadingPricing } = usePricing(cart, shippingAmount);
  const { handleCheckout, isProcessing } = useCheckout();

  const handleQuantityChange = (bookId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(bookId);
    } else {
      updateQuantity(bookId, newQuantity);
    }
  };

  const handleClearCart = () => {
    const itemCount = cart.length;
    clearCart();
    toast.warning('Cart cleared', {
      description: `Removed ${itemCount} ${itemCount === 1 ? 'item' : 'items'} from your cart.`,
    });
  };

  const handleShippingSubmit = async (address: ShippingAddress) => {
    setIsCalculatingShipping(true);
    try {
      const response = await fetch(API_ENDPOINTS.SHIPPING, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate shipping');
      }

      const data = await response.json();
      setShippingAmount(data.shippingAmount);
      setShippingAddress(address);
      toast.success('Shipping calculated', {
        description: `Shipping cost: $${data.shippingAmount.toFixed(2)}`,
      });
    } catch (err) {
      console.error('Error calculating shipping:', err);
      toast.error('Failed to calculate shipping', {
        description: 'Please try again.',
      });
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some books to your cart to get started!
            </p>
            <Link href="/">
              <Button size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Books
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Shopping Cart
            </h2>
            <p className="text-gray-600">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <CartItem
              key={item.book.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <div className="space-y-6">
          <ShippingAddressForm
            onSubmit={handleShippingSubmit}
            isLoading={isCalculatingShipping}
          />

          <PricingSummary
            pricing={pricing}
            isLoading={isLoadingPricing}
            onCheckout={() => handleCheckout(cart, shippingAddress)}
            isProcessing={isProcessing}
            hasShippingAddress={shippingAddress !== null}
            shippingAmount={shippingAmount}
          />
        </div>
      </main>
    </div>
  );
}
