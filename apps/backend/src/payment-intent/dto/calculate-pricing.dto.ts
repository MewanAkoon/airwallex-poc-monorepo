import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItem } from '@poc/shared';
import { ShippingAddressDto } from './shipping-address.dto';

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

export class CalculatePricingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItem[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
