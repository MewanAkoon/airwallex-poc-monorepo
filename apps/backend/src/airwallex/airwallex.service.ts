import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
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
  /** Get the API token for the Airwallex API. */
  private async getApiToken(config = getAirwallexConfig()): Promise<string> {
    const authResponse = await axios.post(
      `${config.apiBaseUrl}/api/v1/authentication/login`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-client-id': config.clientId!,
          'x-api-key': config.apiKey!,
        },
      }
    );

    return authResponse.data.token;
  }

  /** Build the order payload for payment intent creation. */
  private buildOrderPayload(
    amount: number,
    currency: string,
    cartItems: CartItem[],
    options: {
      shippingAddress?: CreatePaymentIntentParams['shippingAddress'];
      shippingAmount?: number;
      taxAmount?: number;
    } = {}
  ): Record<string, unknown> {
    const merchantOrderId = `ORD-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;
    const { shippingAddress, shippingAmount = 0, taxAmount = 0 } = options;

    const products: Array<Record<string, unknown>> = cartItems.map((item) => ({
      image_url: item.book.imageUrl,
      url: item.book.imageUrl,
      name: item.book.title,
      desc: `Book: ${item.book.title}`,
      unit_price: item.book.price.toFixed(2),
      currency,
      quantity: item.quantity,
    }));

    if (taxAmount > 0) {
      products.push({
        name: 'Tax',
        desc: 'Tax',
        image_url: '',
        url: '',
        unit_price: taxAmount.toFixed(2),
        currency,
        quantity: 1,
      });
    }

    const payload: Record<string, unknown> = {
      request_id: uuid(),
      merchant_order_id: merchantOrderId,
      amount: amount.toFixed(2),
      currency,
      order: {
        products,
      },
    };

    if (shippingAddress) {
      const shipping: Record<string, unknown> = {
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
        shipping.fee_amount = shippingAmount.toFixed(2);
      }
      (payload.order as Record<string, unknown>).shipping = shipping;
    }

    return payload;
  }

  /** Create a payment intent using the Airwallex API. */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentData> {
    const { amount, currency, cartItems, returnUrl, shippingAddress, shippingAmount, taxAmount } =
      params;
    const config = getAirwallexConfig();
    const token = await this.getApiToken(config);

    const payload = this.buildOrderPayload(amount, currency, cartItems, {
      shippingAddress,
      shippingAmount,
      taxAmount,
    });
    (payload as Record<string, unknown>).return_url = returnUrl;

    const response = await axios.post(
      `${config.apiBaseUrl}/api/v1/pa/payment_intents/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  }
}
