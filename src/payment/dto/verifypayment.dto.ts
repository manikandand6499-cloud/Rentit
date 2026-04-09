// verifypayment.dto.ts
export class CreateOrderDto {
  @IsNumber()
@Type(() => Number)
amount: number;
}