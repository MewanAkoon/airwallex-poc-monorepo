import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  handleWebhook(payload: any): void {
    const eventType = payload.type || payload.event_type;

    console.log('=== Airwallex Webhook Received ===');
    console.log('Event Type:', eventType);
    console.log('Full Payload:', JSON.stringify(payload, null, 2));
    console.log('==================================');

    // Handle specific event types
    if (eventType === 'payment_intent.succeeded' || payload.type === 'payment_intent.succeeded') {
      console.log('✅ Payment Intent Succeeded');
      console.log('Payment Intent ID:', payload.data?.id || payload.object?.id);
      console.log('Amount:', payload.data?.amount || payload.object?.amount);
      console.log('Currency:', payload.data?.currency || payload.object?.currency);
    } else if (eventType === 'payment_intent.failed' || payload.type === 'payment_intent.failed') {
      console.log('❌ Payment Intent Failed');
      console.log('Payment Intent ID:', payload.data?.id || payload.object?.id);
      console.log(
        'Failure Reason:',
        payload.data?.failure_reason || payload.object?.failure_reason
      );
    } else {
      console.log('ℹ️  Other event type:', eventType);
    }
  }
}
