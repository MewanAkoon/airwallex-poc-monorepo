export interface Book {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface PricingBreakdown {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  /** Tax rate as percentage (e.g. 8.875). Set when using Quaderno. */
  taxRate?: number;
}
