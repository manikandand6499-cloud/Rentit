import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateVisitDto {

  @Type(() => Number)
  @IsNumber()
propertyId: number | undefined;

  // 📅 Date (YYYY-MM-DD)
  @IsDateString()
  date: string | undefined;

  // ⏰ Time (HH:mm)
  @IsString()
  @IsNotEmpty()
  time: string | undefined;
}