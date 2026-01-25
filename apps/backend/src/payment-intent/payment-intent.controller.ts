import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { PaymentIntentService } from "./payment-intent.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { CalculateShippingDto } from "./dto/calculate-shipping.dto";

@Controller("payment-intent")
export class PaymentIntentController {
  constructor(private readonly paymentIntentService: PaymentIntentService) {}

  @Post("pricing")
  async calculatePricing(@Body() dto: CreatePaymentIntentDto) {
    try {
      const pricing = this.paymentIntentService.calculatePricing(
        dto.cartItems || [],
        dto.shippingAmount,
      );
      return pricing;
    } catch (error: any) {
      console.error("Error calculating pricing:", error);
      throw new HttpException(
        {
          error: error?.message || "Failed to calculate pricing",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("shipping")
  async calculateShipping(@Body() dto: CalculateShippingDto) {
    try {
      const shippingAmount = this.paymentIntentService.calculateShipping({
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        country: dto.country,
      });
      return { shippingAmount };
    } catch (error: any) {
      console.error("Error calculating shipping:", error);
      throw new HttpException(
        {
          error: error?.message || "Failed to calculate shipping",
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    try {
      const frontendBaseUrl =
        process.env.FRONTEND_BASE_URL || "http://localhost:3000";
      const returnUrl = `${frontendBaseUrl}/`;

      const result = await this.paymentIntentService.createPaymentIntent(
        dto.cartItems,
        returnUrl,
        dto.shippingAddress,
        dto.shippingAmount,
      );

      return result;
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      throw new HttpException(
        {
          error: error?.message || "Failed to create payment intent",
          details: error?.response?.data || undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
