import { IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";
// verifypayment.dto.ts
export class CreateOrderDto {
  @IsNumber()
@Type(() => Number)
amount: number | undefined;
}