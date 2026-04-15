import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateDetailsDto {

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredGuests?: string[];

  @IsOptional()
  @IsDateString()
  availableFrom?: string;


    @IsOptional()
  @IsDateString()
  city?: string;

    @IsOptional()
  @IsDateString()
  locality?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  noticePeriod?: number;

  @IsOptional()
  @IsString()
  gateClosingTime?: string;
}