import { Module } from "@nestjs/common";
import { PaymentIntentModule } from "./payment-intent/payment-intent.module";
import { WebhooksModule } from "./webhooks/webhooks.module";

@Module({
  imports: [PaymentIntentModule, WebhooksModule],
})
export class AppModule {}
