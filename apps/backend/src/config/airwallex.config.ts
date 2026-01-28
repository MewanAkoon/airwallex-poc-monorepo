export interface AirwallexConfig {
  clientId?: string;
  apiKey?: string;
  apiBaseUrl: string;
}

export function getAirwallexConfig(): AirwallexConfig {
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  const apiBaseUrl = process.env.AIRWALLEX_API_BASE_URL || 'https://api-demo.airwallex.com';

  return {
    clientId,
    apiKey,
    apiBaseUrl,
  };
}
