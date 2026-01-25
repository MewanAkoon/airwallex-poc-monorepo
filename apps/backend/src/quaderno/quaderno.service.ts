import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TAX_RATE } from '@poc/shared';
import { getQuadernoConfig } from '../config/quaderno.config';

export interface TaxAddress {
  country: string;
  zipCode: string;
  state?: string;
  city?: string;
}

export interface TaxResult {
  taxAmount: number;
  rate: number;
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
  async calculateTax(amount: number, address: TaxAddress): Promise<TaxResult> {
    const config = getQuadernoConfig();

    if (!config.enabled) {
      return {
        taxAmount: amount * TAX_RATE,
        rate: TAX_RATE * 100,
      };
    }

    const params = new URLSearchParams({
      to_country: address.country,
      to_postal_code: address.zipCode,
      product_type: 'good',
      tax_code: 'standard',
      amount: amount.toFixed(2),
      currency: 'USD',
    });
    if (address.city) params.set('to_city', address.city);
    if (address.state) params.set('to_region', address.state);
    if (config.fromCountry) params.set('from_country', config.fromCountry);
    if (config.fromPostalCode) params.set('from_postal_code', config.fromPostalCode);

    const url = `${config.apiBaseUrl}/tax_rates/calculate?${params}`;
    const auth = Buffer.from(`${config.apiKey}:x`).toString('base64');

    const { data } = await axios.get<{
      tax_amount: number | null;
      additional_tax_amount?: number | null;
      rate: number;
      additional_rate?: number;
      status?: string;
    }>(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    });

    if (data.status === 'not_registered') {
      console.warn(
        'Quaderno status not_registered; using fallback rate. Register the destination jurisdiction and a Tax ID in Quaderno Settings → Tax Jurisdictions.'
      );
      return {
        taxAmount: amount * TAX_RATE,
        rate: TAX_RATE * 100,
      };
    }

    const main = data.tax_amount ?? 0;
    const additional = data.additional_tax_amount ?? 0;
    return {
      taxAmount: main + additional,
      rate: data.rate ?? 0,
    };
  }
}
