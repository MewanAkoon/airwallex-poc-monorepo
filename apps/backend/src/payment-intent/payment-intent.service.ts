import { Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import axios from "axios";
import {
  CartItem,
  PricingBreakdown,
  TAX_RATE,
} from "@poc/shared";
import { getAirwallexConfig } from "../config/airwallex.config";

export interface PaymentIntentResponse {
  id: string;
  client_secret: string;
  currency: string;
  amount: number;
  hosted_checkout_url?: string;
}

@Injectable()
export class PaymentIntentService {
  private config = getAirwallexConfig();

  /**
   * Calculate pricing breakdown from cart items
   * If shippingAmount is undefined, shipping is set to 0 (not calculated yet)
   */
  calculatePricing(cartItems: CartItem[], shippingAmount?: number): PricingBreakdown {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0,
    );
    const tax = subtotal * TAX_RATE;
    // Only include shipping if it's been calculated (not undefined)
    const shipping = shippingAmount !== undefined ? shippingAmount : 0;
    const total = subtotal + tax + shipping;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Calculate shipping cost based on address
   * For now, returns a random amount between $5 and $15
   * @param address - Shipping address (not used in current implementation)
   */
  calculateShipping(address: {
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }): number {
    // For now, return a random shipping amount
    // In production, this would integrate with a shipping API based on address
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = address; // Address will be used in production
    const minShipping = 5.0;
    const maxShipping = 15.0;
    const randomShipping = Math.random() * (maxShipping - minShipping) + minShipping;
    return Math.round(randomShipping * 100) / 100;
  }

  /**
   * Create payment intent using dummy API (no authentication)
   */
  private async createPaymentIntentDummy(
    amount: number,
    currency: string,
    cartItems: CartItem[],
    returnUrl: string,
    shippingAddress?: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
  ): Promise<any> {
    const merchantOrderId = `ORD-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;

    const payload: any = {
      request_id: uuid(),
      merchant_order_id: merchantOrderId,
      amount: amount.toFixed(2),
      currency,
      return_url: returnUrl,
      order: {
        products: cartItems.map((item) => ({
          image_url: item.book.imageUrl,
          url: item.book.imageUrl,
          name: item.book.title,
          desc: `Book: ${item.book.title}`,
          unit_price: item.book.price.toFixed(2),
          currency,
          quantity: item.quantity,
        })),
      },
    };

    // Add shipping information if provided (Airwallex API format)
    if (shippingAddress) {
      payload.order.shipping = {
        address: {
          city: shippingAddress.city,
          country_code: shippingAddress.country,
          postcode: shippingAddress.zipCode,
          state: shippingAddress.state,
          street: shippingAddress.address,
        },
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        phone_number: '', // Phone number not collected in form
        shipping_method: 'Standard',
      };
    }

    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/v1/pa/payment_intents/create`,
      payload,
    );

    return response.data;
  }

  /**
   * Create payment intent using real Airwallex API (with authentication)
   */
  private async createPaymentIntentReal(
    amount: number,
    currency: string,
    cartItems: CartItem[],
    returnUrl: string,
    shippingAddress?: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
  ): Promise<any> {
    // For real API, we would use @airwallex/node-sdk
    // Since we're supporting both, we'll use axios for now
    // In production, you'd use the SDK's PaymentIntent.create() method

    // First, authenticate to get token
    const authResponse = await axios.post(
      `${this.config.apiBaseUrl.replace("demo-pacheckoutdemo", "api-demo")}/api/v1/authentication/login`,
      {},
      {
        headers: {
          "x-client-id": this.config.clientId!,
          "x-api-key": this.config.apiKey!,
        },
      },
    );

    const token = authResponse.data.token;
    const merchantOrderId = `ORD-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;

    const payload: any = {
      request_id: uuid(),
      merchant_order_id: merchantOrderId,
      amount: amount.toFixed(2),
      currency,
      return_url: returnUrl,
      order: {
        products: cartItems.map((item) => ({
          image_url: item.book.imageUrl,
          url: item.book.imageUrl,
          name: item.book.title,
          desc: `Book: ${item.book.title}`,
          unit_price: item.book.price.toFixed(2),
          currency,
          quantity: item.quantity,
        })),
      },
    };

    // Add shipping information if provided (Airwallex API format)
    if (shippingAddress) {
      payload.order.shipping = {
        address: {
          city: shippingAddress.city,
          country_code: shippingAddress.country,
          postcode: shippingAddress.zipCode,
          state: shippingAddress.state,
          street: shippingAddress.address,
        },
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        phone_number: '', // Phone number not collected in form
        shipping_method: 'Standard',
      };
    }

    const pciApiUrl = this.config.apiBaseUrl.replace(
      "demo-pacheckoutdemo",
      "pci-api-demo",
    );
    const response = await axios.post(
      `${pciApiUrl}/api/v1/pa/payment_intents/create`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(
    cartItems: CartItem[],
    returnUrl: string,
    shippingAddress?: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
    shippingAmount?: number,
  ): Promise<PaymentIntentResponse> {
    if (cartItems.length === 0) {
      throw new Error("Cart cannot be empty");
    }

    // Calculate pricing with shipping amount if provided
    const pricing = this.calculatePricing(cartItems, shippingAmount);
    const currency = "USD";

    let intentData;

    if (this.config.useDummyApi) {
      console.log("Using dummy API (no authentication)");
      intentData = await this.createPaymentIntentDummy(
        pricing.total,
        currency,
        cartItems,
        returnUrl,
        shippingAddress,
      );
    } else {
      console.log("Using real Airwallex API (with authentication)");
      intentData = await this.createPaymentIntentReal(
        pricing.total,
        currency,
        cartItems,
        returnUrl,
        shippingAddress,
      );
    }

    return {
      id: intentData.id,
      client_secret: intentData.client_secret,
      currency: intentData.currency || currency,
      amount: pricing.total,
      hosted_checkout_url: intentData.hosted_checkout_url,
    };
  }
}
