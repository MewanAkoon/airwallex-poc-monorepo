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

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  /** Street address (maps to Quaderno to_street, Airwallex street). */
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
