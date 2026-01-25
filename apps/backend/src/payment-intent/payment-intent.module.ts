import { Module } from '@nestjs/common';
import { PaymentIntentController } from './payment-intent.controller';
import { PaymentIntentService } from './payment-intent.service';
import { QuadernoModule } from '../quaderno/quaderno.module';
import { AirwallexModule } from '../airwallex/airwallex.module';

@Module({
  imports: [QuadernoModule, AirwallexModule],
  controllers: [PaymentIntentController],
  providers: [PaymentIntentService],
  exports: [PaymentIntentService],
})
export class PaymentIntentModule {}
