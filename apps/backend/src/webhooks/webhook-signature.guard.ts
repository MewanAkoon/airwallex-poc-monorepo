import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Request } from 'express';

/**
 * Verifies Airwallex webhook signature using x-timestamp and x-signature headers.
 * value_to_digest = x-timestamp + raw body (string); HMAC-SHA256 with webhook secret; compare hex to x-signature.
 * @see https://www.airwallex.com/docs/developer-tools/webhooks/listen-for-webhook-events
 */
@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { rawBody?: Buffer }>();
    const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;

    if (!secret) {
      throw new UnauthorizedException('AIRWALLEX_WEBHOOK_SECRET is not configured');
    }

    const rawBody = request.rawBody;
    const timestamp = request.headers['x-timestamp'];
    const signature = request.headers['x-signature'];

    if (!rawBody || typeof timestamp !== 'string' || typeof signature !== 'string') {
      throw new UnauthorizedException('Missing webhook signature headers or body');
    }

    const valueToDigest = timestamp + rawBody.toString('utf8');
    const expectedSignature = createHmac('sha256', secret).update(valueToDigest).digest('hex');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
