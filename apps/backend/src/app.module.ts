import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PaymentIntentModule } from './payment-intent/payment-intent.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
  imports: [PaymentIntentModule, WebhooksModule],
  controllers: [AppController],
})
export class AppModule {}
