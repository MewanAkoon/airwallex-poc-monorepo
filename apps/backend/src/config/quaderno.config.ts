export interface QuadernoConfig {
  apiKey: string | undefined;
  apiBaseUrl: string;
  fromCountry: string | undefined;
  fromPostalCode: string | undefined;
  /** Whether Quaderno is configured (can calculate tax via API) */
  enabled: boolean;
}

export function getQuadernoConfig(): QuadernoConfig {
  const apiKey = process.env.QUADERNO_API_KEY;
  const apiBaseUrl = process.env.QUADERNO_API_BASE_URL || 'https://sandbox-quadernoapp.com';
  const fromCountry = process.env.QUADERNO_FROM_COUNTRY;
  const fromPostalCode = process.env.QUADERNO_FROM_POSTAL_CODE;

  return {
    apiKey,
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    fromCountry: fromCountry || undefined,
    fromPostalCode: fromPostalCode || undefined,
    enabled: !!apiKey,
  };
}
