'use client';

import Image from 'next/image';
import { CartItem as CartItemType } from '@poc/shared';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (bookId: string, quantity: number) => void;
  onRemove: (bookId: string) => void;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const handleRemove = () => {
    onRemove(item.book.id);
    toast.warning('Removed from cart', {
      description: `${item.book.title} has been removed from your cart.`,
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        <div className="relative w-24 h-36 flex-shrink-0">
          <Image
            src={item.book.imageUrl}
            alt={item.book.title}
            fill
            sizes="96px"
            className="object-cover rounded-md"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-lg">{item.book.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {item.book.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <div className="text-xl font-bold text-primary mb-3">
              ${item.book.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-4 mt-auto">
              <div className="flex items-center gap-2 border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onQuantityChange(item.book.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onQuantityChange(item.book.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
