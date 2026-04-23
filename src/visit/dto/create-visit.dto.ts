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
  @IsNotEmpty()
  propertyId: number | undefined;

  // 📅 Date (YYYY-MM-DD)
  @IsDateString()
  @IsNotEmpty()
  date: string | undefined;

  // ⏰ Time (HH:mm or 04:30 PM)
  @IsString()
  @IsNotEmpty()
  time: string | undefined;
}