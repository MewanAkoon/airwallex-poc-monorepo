'use client';

import Image from 'next/image';
import { Book } from '@poc/shared';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface BookCardProps {
  book: Book;
  onAddToCart: (book: Book) => void;
}

export function BookCard({ book, onAddToCart }: BookCardProps) {
  const handleAddToCart = () => {
    onAddToCart(book);
    toast.success('Added to cart', {
      description: `${book.title} has been added to your cart.`,
    });
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <div className="book-image">
        <Image
          src={book.imageUrl}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          priority={false}
        />
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
        <CardDescription className="line-clamp-3">{book.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">${book.price.toFixed(2)}</div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAddToCart} className="w-full" size="lg">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
