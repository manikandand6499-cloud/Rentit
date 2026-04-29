import { IsOptional, IsString, IsBoolean } from "class-validator";

export class CreateAdditionalDto {

  @IsOptional()
  @IsString()
  propertyDescription?: string;

  @IsOptional()
  @IsString()
  previousOccupancy?: string;

  @IsOptional()
  @IsString()
  shownBy?: string;

  @IsOptional()
  @IsString()
  propertypainted?: string;

  @IsOptional()
  @IsString()
  propertycleaned?: string;

  @IsOptional()
  @IsString()
  secondaryNumber?: string;
}