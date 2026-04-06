import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateVisitDto {
  @IsNumber()
  propertyId: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;
}