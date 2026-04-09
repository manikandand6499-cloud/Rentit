// create-order.dto.ts
import { IsNumber } from "class-validator";

export class CreateOrderDto {
 @IsNumber()
@Type(() => Number)
amount: number;
}