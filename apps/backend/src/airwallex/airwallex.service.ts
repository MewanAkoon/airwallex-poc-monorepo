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
}

export interface PaymentIntentData {
  id: string;
  client_secret: string;
  currency: string;
  hosted_checkout_url?: string;
}

@Injectable()
export class AirwallexService {
  /**
   * Create a payment intent. Uses dummy API when configured, otherwise
   * real Airwallex API with authentication.
   */
  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentData> {
    const config = getAirwallexConfig();

    if (config.useDummyApi) {
      console.log('Using dummy API (no authentication)');
      return this.createDummy(params);
    }

    console.log('Using real Airwallex API (with authentication)');
    return this.createReal(params);
  }

  private buildOrderPayload(
    amount: number,
    currency: string,
    cartItems: CartItem[],
    shippingAddress?: CreatePaymentIntentParams['shippingAddress']
  ): Record<string, unknown> {
    const merchantOrderId = `ORD-${Date.now()}-${uuid().substring(0, 8).toUpperCase()}`;

    const payload: Record<string, unknown> = {
      request_id: uuid(),
      merchant_order_id: merchantOrderId,
      amount: amount.toFixed(2),
      currency,
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

    if (shippingAddress) {
      (payload.order as Record<string, unknown>).shipping = {
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
    }

    return payload;
  }

  private async createDummy(params: CreatePaymentIntentParams): Promise<PaymentIntentData> {
    const { amount, currency, cartItems, returnUrl, shippingAddress } = params;
    const config = getAirwallexConfig();

    const payload = this.buildOrderPayload(amount, currency, cartItems, shippingAddress);
    (payload as Record<string, unknown>).return_url = returnUrl;

    const response = await axios.post(
      `${config.apiBaseUrl}/api/v1/pa/payment_intents/create`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  }

  private async createReal(params: CreatePaymentIntentParams): Promise<PaymentIntentData> {
    const { amount, currency, cartItems, returnUrl, shippingAddress } = params;
    const config = getAirwallexConfig();

    const authResponse = await axios.post(
      `${config.apiBaseUrl.replace('demo-pacheckoutdemo', 'api-demo')}/api/v1/authentication/login`,
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

    const token = authResponse.data.token;

    const payload = this.buildOrderPayload(amount, currency, cartItems, shippingAddress);
    (payload as Record<string, unknown>).return_url = returnUrl;

    const pciApiUrl = config.apiBaseUrl.replace('demo-pacheckoutdemo', 'pci-api-demo');
    const response = await axios.post(`${pciApiUrl}/api/v1/pa/payment_intents/create`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
}
