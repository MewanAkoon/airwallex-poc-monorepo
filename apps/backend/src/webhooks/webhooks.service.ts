import { Injectable } from '@nestjs/common';
import type { AirwallexWebhookPayload } from './webhook.types';

@Injectable()
export class WebhooksService {
  handleWebhook(payload: AirwallexWebhookPayload | Record<string, unknown>): void {
    const p = payload as Record<string, unknown>;
    const eventName = p.name;
    const id = p.id;
    const accountId = p.account_id;
    const createdAt = p.created_at;
    const version = p.version;

    console.log('=== Airwallex Webhook ===');
    console.log('Event:', eventName ?? '(unknown)');
    console.log('ID:', id ?? '-');
    console.log('Account ID:', accountId ?? '-');
    console.log('Created at:', createdAt ?? '-');
    if (version != null) console.log('Version:', version);
    console.log('--- Full payload ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('=====================');
  }
}
