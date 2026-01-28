import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Env as AirwallexEnv } from '@airwallex/components-sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAirwallexEnv(): AirwallexEnv {
  const value = process.env.NEXT_PUBLIC_AIRWALLEX_ENV;

  if (value === 'demo' || value === 'dev' || value === 'staging' || value === 'prod') {
    return value;
  }

  return 'demo';
}
