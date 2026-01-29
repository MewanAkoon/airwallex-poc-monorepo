import { Injectable } from '@nestjs/common';
import { CartItem, PricingBreakdown, ShippingAddress } from '@poc/shared';
import { QuadernoService } from '../quaderno/quaderno.service';
import { AirwallexService } from '../airwallex/airwallex.service';

export interface PaymentIntentResponse {
  id: string;
  client_secret: string;
  currency: string;
  amount: number;
  cartItems: CartItem[];
  pricing: PricingBreakdown;
}

@Injectable()
export class PaymentIntentService {
  constructor(
    private readonly quaderno: QuadernoService,
    private readonly airwallex: AirwallexService
  ) {}

  /**
   * Calculate pricing with location-based tax (Quaderno) or fallback flat rate.
   * Tax and total are only correct after the customer's address is provided.
   * All books are treated as physical goods from one default fulfillment location.
   */
  async calculatePricingWithTax(
    cartItems: CartItem[],
    shippingAddress: ShippingAddress,
    shippingAmount: number = 0
  ): Promise<PricingBreakdown> {
    const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
    const subtotalRounded = Math.round(subtotal * 100) / 100;
    const amountForTax = subtotalRounded + shippingAmount;

    const { taxAmount, rate, totalAmount } = await this.quaderno.calculateTax(
      amountForTax,
      shippingAddress
    );

    const taxRounded = Math.round(taxAmount * 100) / 100;
    // Use Quaderno's totalAmount (taxable amount + tax) instead of manual calculation
    const total = Math.round(totalAmount * 100) / 100;

    return {
      subtotal: subtotalRounded,
      tax: taxRounded,
      shipping: shippingAmount,
      total,
      taxRate: rate,
    };
  }

  /**
   * Calculate shipping cost based on address (and later: book weight).
   * TODO: Use book weight from cart items for real carrier rates. Not implemented yet.
   */
  calculateShipping(address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): number {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = address;
    const minShipping = 5.0;
    const maxShipping = 15.0;
    const randomShipping = Math.random() * (maxShipping - minShipping) + minShipping;
    return Math.round(randomShipping * 100) / 100;
  }

  /**
   * Create payment intent. When pricing is provided (from cart page), use it so checkout shows
   * the same amounts. Otherwise compute shipping and tax on the backend.
   */
  async createPaymentIntent(
    cartItems: CartItem[],
    returnUrl: string,
    shippingAddress: ShippingAddress,
    pricingFromCart?: PricingBreakdown
  ): Promise<PaymentIntentResponse> {
    if (cartItems.length === 0) {
      throw new Error('Cart cannot be empty');
    }

    const currency = 'USD';
    const pricing =
      pricingFromCart != null
        ? pricingFromCart
        : await (async () => {
            const shippingAmount = this.calculateShipping(shippingAddress);
            return this.calculatePricingWithTax(cartItems, shippingAddress, shippingAmount);
          })();

    const intentData = await this.airwallex.createPaymentIntent({
      amount: pricing.total,
      currency,
      cartItems,
      returnUrl,
      shippingAddress,
      shippingAmount: pricing.shipping,
      taxAmount: pricing.tax,
    });

    return {
      id: intentData.id,
      client_secret: intentData.client_secret,
      currency: intentData.currency || currency,
      amount: pricing.total,
      cartItems,
      pricing,
    };
  }
}
