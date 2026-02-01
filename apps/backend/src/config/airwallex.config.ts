export type AirwallexEnv = 'demo' | 'prod';

export interface AirwallexConfig {
  clientId?: string;
  apiKey?: string;
  env?: AirwallexEnv;
}

function parseAirwallexEnv(value: string | undefined): AirwallexEnv {
  const normalized = value?.toLowerCase();
  if (['demo', 'prod'].includes(normalized ?? '')) return normalized as AirwallexEnv;
  return 'demo';
}

export function getAirwallexConfig(): AirwallexConfig {
  const clientId = process.env.AIRWALLEX_CLIENT_ID || '';
  const apiKey = process.env.AIRWALLEX_API_KEY || '';
  const env = parseAirwallexEnv(process.env.AIRWALLEX_ENV);

  return { clientId, apiKey, env };
}
