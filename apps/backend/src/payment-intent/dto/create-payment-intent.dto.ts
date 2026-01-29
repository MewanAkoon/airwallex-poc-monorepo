import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CartItem } from '@poc/shared';
import { ShippingAddressDto } from './shipping-address.dto';

class PricingDto {
  @IsNumber()
  subtotal: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  shipping: number;

  @IsNumber()
  total: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;
}

class BookDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  price: number;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  description: string;
}

class CartItemDto {
  @ValidateNested()
  @Type(() => BookDto)
  book: BookDto;

  @IsNumber()
  quantity: number;
}

export class CreatePaymentIntentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItem[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  /** When provided (from cart page), used so checkout shows the same amounts as cart. */
  @IsOptional()
  @ValidateNested()
  @Type(() => PricingDto)
  pricing?: PricingDto;
}
