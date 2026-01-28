/**
 * Generic type for Airwallex webhook payloads.
 * Common top-level fields for all event types.
 * @see https://www.airwallex.com/docs/events
 */
export interface AirwallexWebhookPayload {
  id: string;
  name: string;
  account_id: string;
  data: unknown;
  created_at: string;
  version?: string;
}
