'use client';

import { Header } from '@/components/Header';
import { BookCard } from '@/components/BookCard';
import { useCart } from '@/contexts/CartContext';
import { BOOKS } from '@/data/books';

export default function Home() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Our Collection
          </h2>
          <p className="text-gray-600">
            Discover amazing books and add them to your cart
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {BOOKS.map((book) => (
            <BookCard key={book.id} book={book} onAddToCart={addToCart} />
          ))}
        </div>
      </main>
    </div>
  );
}
