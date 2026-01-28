import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhookSignatureGuard } from './webhook-signature.guard';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('airwallex')
  @HttpCode(HttpStatus.OK)
  @UseGuards(WebhookSignatureGuard)
  async handleAirwallexWebhook(@Body() payload: Record<string, unknown>) {
    this.webhooksService.handleWebhook(payload);
    return { received: true };
  }
}
