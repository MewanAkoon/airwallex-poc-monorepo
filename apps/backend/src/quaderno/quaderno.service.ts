import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TAX_RATE, ShippingAddress } from '@poc/shared';
import { getQuadernoConfig } from '../config/quaderno.config';

export interface TaxResult {
  taxAmount: number;
  rate: number;
  /** Total amount including tax (taxable amount + tax). From Quaderno total_amount or calculated for fallback. */
  totalAmount: number;
}

function fallbackTaxResult(amount: number): TaxResult {
  const taxAmount = amount * TAX_RATE;
  return {
    taxAmount,
    rate: TAX_RATE * 100,
    totalAmount: amount + taxAmount,
  };
}

/**
 * Quaderno tax calculation. When disabled or when the business is not registered
 * in the customer's jurisdiction (status: not_registered), falls back to TAX_RATE.
 */
@Injectable()
export class QuadernoService {
  /**
   * Calculate tax for an amount and destination address.
   * Uses Quaderno when enabled and the jurisdiction is registered; otherwise
   * returns the flat TAX_RATE fallback.
   */
  async calculateTax(amount: number, shippingAddress: ShippingAddress): Promise<TaxResult> {
    const config = getQuadernoConfig();

    if (!config.enabled) {
      return fallbackTaxResult(amount);
    }

    const params = new URLSearchParams({
      to_country: shippingAddress.country,
      to_postal_code: shippingAddress.zipCode,
      product_type: 'good',
      tax_code: 'standard',
      amount: amount.toFixed(2),
      // TODO: should get from user (reader location or if reader manually sets the location)
      currency: 'USD',
      tax_behavior: 'exclusive',
    });

    if (shippingAddress.city) params.set('to_city', shippingAddress.city);
    if (shippingAddress.address) params.set('to_street', shippingAddress.address);

    if (config.fromCountry) params.set('from_country', config.fromCountry);
    if (config.fromPostalCode) params.set('from_postal_code', config.fromPostalCode);

    const url = `${config.apiBaseUrl}/tax_rates/calculate?${params}`;

    const auth = Buffer.from(`${config.apiKey}:x`).toString('base64');

    const headers = {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    };

    const { data } = await axios.get<{
      tax_amount: number | null;
      additional_tax_amount?: number | null;
      rate: number;
      additional_rate?: number;
      status?: string;
      total_amount?: number;
    }>(url, { headers });

    if (data.status === 'not_registered') {
      return fallbackTaxResult(amount);
    }

    const main = data.tax_amount ?? 0;
    const additional = data.additional_tax_amount ?? 0;
    const taxAmount = main + additional;
    // Use Quaderno's total_amount if available, otherwise calculate: taxable amount + tax
    const totalAmount = data.total_amount ?? amount + taxAmount;

    return {
      taxAmount,
      rate: data.rate ?? 0,
      totalAmount,
    };
  }
}
