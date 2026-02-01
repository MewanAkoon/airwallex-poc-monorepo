import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import {
  Airwallex,
  ApiError,
  type PaymentAcceptancePaymentIntentCreateRequestRaw,
  type PaymentAcceptancePurchaseOrderCreate,
  type PaymentAcceptanceProduct,
  type PaymentAcceptanceShippingCreate,
} from '@airwallex/node-sdk';
import { CartItem, ShippingAddress } from '@poc/shared';
import { getAirwallexConfig } from '../config/airwallex.config';

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  cartItems: CartItem[];
  returnUrl: string;
  shippingAddress?: ShippingAddress;
  /** Shipping fee amount; sent as order.shipping.fee_amount on the payment intent. */
  shippingAmount?: number;
  /** Tax amount; sent as a product line in order.products so it appears in the intent. */
  taxAmount?: number;
}

export interface PaymentIntentData {
  id: string;
  client_secret: string;
  currency: string;
}

@Injectable()
export class AirwallexService {
  private client: Airwallex | null = null;

  /** Lazy-initialized Airwallex SDK client. Handles auth (login/token refresh) internally. */
  private getClient(): Airwallex {
    if (!this.client) {
      const config = getAirwallexConfig();
      if (!config.clientId || !config.apiKey) {
        throw new Error(
          'Airwallex credentials missing: set AIRWALLEX_CLIENT_ID and AIRWALLEX_API_KEY'
        );
      }
      this.client = new Airwallex({
        clientId: config.clientId,
        apiKey: config.apiKey,
        env: config.env,
        apiVersion: '2025-02-14',
      });
    }
    return this.client;
  }

  /** Build order payload for payment intent creation using SDK types. */
  private buildOrder(
    cartItems: CartItem[],
    options: {
      shippingAddress?: CreatePaymentIntentParams['shippingAddress'];
      shippingAmount?: number;
      taxAmount?: number;
    } = {}
  ): PaymentAcceptancePurchaseOrderCreate {
    const { shippingAddress, shippingAmount = 0, taxAmount = 0 } = options;

    const products: PaymentAcceptanceProduct[] = cartItems.map((item) => ({
      image_url: item.book.imageUrl,
      url: item.book.imageUrl,
      name: item.book.title,
      desc: `Book: ${item.book.title}`,
      unit_price: Number(item.book.price.toFixed(2)),
      quantity: item.quantity,
    }));

    if (taxAmount > 0) {
      products.push({
        name: 'Tax',
        desc: 'Tax',
        image_url: '',
        url: '',
        unit_price: Number(taxAmount.toFixed(2)),
        quantity: 1,
      });
    }

    const order: PaymentAcceptancePurchaseOrderCreate = {
      products,
    };

    if (shippingAddress) {
      const shipping: PaymentAcceptanceShippingCreate = {
        address: {
          city: shippingAddress.city,
          country_code: shippingAddress.country,
          postcode: shippingAddress.zipCode,
          state: shippingAddress.state,
          street: shippingAddress.address,
        },
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        phone_number: '',
        shipping_method: 'Standard',
      };
      if (shippingAmount > 0) {
        shipping.fee_amount = Number(shippingAmount.toFixed(2));
      }
      order.shipping = shipping;
    }

    return order;
  }

  /** Create a payment intent using the Airwallex Node SDK. */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentData> {
    const { amount, currency, cartItems, returnUrl, shippingAddress, shippingAmount, taxAmount } =
      params;

    const merchantOrderId = `ORD-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;
    const order = this.buildOrder(cartItems, {
      shippingAddress,
      shippingAmount,
      taxAmount,
    });

    const request: PaymentAcceptancePaymentIntentCreateRequestRaw = {
      request_id: uuid(),
      amount: Number(amount.toFixed(2)),
      currency,
      merchant_order_id: merchantOrderId,
      return_url: returnUrl,
      descriptor: 'Bookstore Order',
      order,
    };

    try {
      const response =
        await this.getClient().paymentAcceptance.paymentIntents.createPaymentIntent(request);

      const id = response.id;
      const client_secret = response.client_secret;
      const responseCurrency = response.currency ?? currency;

      if (!id || !client_secret) {
        throw new Error('Airwallex create payment intent response missing id or client_secret');
      }

      return {
        id,
        client_secret,
        currency: responseCurrency,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(
          `Airwallex API error (${error.status}): ${JSON.stringify(error.data ?? error.message)}`
        );
      }
      throw error;
    }
  }
}
