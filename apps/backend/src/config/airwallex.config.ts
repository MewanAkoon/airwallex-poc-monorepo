export interface AirwallexConfig {
  clientId?: string;
  apiKey?: string;
  env: 'sandbox' | 'production';
  apiBaseUrl: string;
  useDummyApi: boolean;
}

export function getAirwallexConfig(): AirwallexConfig {
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const apiBaseUrl =
    process.env.AIRWALLEX_API_BASE_URL || 'https://demo-pacheckoutdemo.airwallex.com';

  // Use dummy API if no credentials provided
  const useDummyApi = !clientId || !apiKey;

  return {
    clientId,
    apiKey,
    env: (process.env.AIRWALLEX_ENV as 'sandbox' | 'production') || 'sandbox',
    apiBaseUrl,
    useDummyApi,
  };
}
