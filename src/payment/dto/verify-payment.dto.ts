export class VerifyPaymentDto {
  @IsString()
  razorpay_order_id: string;

  @IsString()
  razorpay_payment_id: string;

  @IsString()
  razorpay_signature: string;

  @IsString()
  planType: string;

@IsNumber()
@Type(() => Number)
amount: number;

  @IsString()
  propertyType: string;
}