import { IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

export class VerifyPaymentDto {
  @IsString()
  razorpay_order_id: string | undefined;

  @IsString()
  razorpay_payment_id: string | undefined;

  @IsString()
  razorpay_signature: string | undefined;

  @IsString()
  planType: string | undefined;

@IsNumber()
@Type(() => Number)
amount: number | undefined;

  @IsString()
  propertyType: string | undefined;
}