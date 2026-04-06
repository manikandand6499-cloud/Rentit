import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsString,
  IsArray
} from "class-validator";

import { Type } from "class-transformer";

export class CreateRentDto {

  @IsString()
  rentType: string;   // ⬅️⬅️ MAIN FIX

  @Type(() => Number)
  @IsNumber()
  expectedRent: number;

  @Type(() => Number)
  @IsNumber()
  deposit: number;

@IsOptional()
@Type(() => Number)
@IsNumber()
maintenanceAmount?: number;

  @IsOptional()
  @IsBoolean()
  rentNegotiable?: boolean;

  @IsOptional()
  @IsString()
  maintenance?: string;

  @IsOptional()
  @IsString()
  availableFrom?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];

  @IsOptional()
  furnishing?: any;

  @IsOptional()
  parking?: any;

  @IsOptional()
  @IsString()
  description?: string;
}