'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { CartItem, Book } from '@poc/shared';

interface CartContextType {
  cart: CartItem[];
  addToCart: (book: Book) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bookstore-cart';
const CHECKOUT_RETURN_KEY = 'checkout-return';

// Load cart from localStorage synchronously (client-side only)
function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }

  return [];
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with empty array, then immediately load from localStorage
  // This ensures server and client both start with [] to avoid hydration mismatch
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage immediately after mount
  useEffect(() => {
    const loadedCart = loadCartFromStorage();
    setCart(loadedCart);
    setIsHydrated(true);

    // Check if returning from checkout and clear cart if so
    const returningFromCheckout = sessionStorage.getItem(CHECKOUT_RETURN_KEY);
    if (returningFromCheckout === 'true') {
      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);
      sessionStorage.removeItem(CHECKOUT_RETURN_KEY);
    }
  }, []);

  // Save cart to localStorage whenever it changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        if (cart.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isHydrated]);

  const addToCart = (book: Book) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.book.id === book.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.book.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { book, quantity: 1 }];
    });
  };

  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(bookId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.book.id === bookId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (bookId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.book.id !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Helper function to mark checkout return
export function markCheckoutReturn() {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(CHECKOUT_RETURN_KEY, 'true');
  }
}
