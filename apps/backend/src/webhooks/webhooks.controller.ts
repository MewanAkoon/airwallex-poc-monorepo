import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('airwallex')
  @HttpCode(HttpStatus.OK)
  async handleAirwallexWebhook(@Body() payload: any) {
    this.webhooksService.handleWebhook(payload);
    return { received: true };
  }
}
