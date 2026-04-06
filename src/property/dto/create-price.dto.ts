import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsString,
  IsArray
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreatePriceDto {

  /*
  ==============================
  EXPECTED RENT
  ==============================
  */
  @Type(() => Number)
  @IsNumber()
  expectedRent: number;

  /*
  ==============================
  DEPOSIT
  ==============================
  */
  @Type(() => Number)
  @IsNumber()
  deposit: number;

  /*
  ==============================
  MAINTENANCE EXTRA
  ==============================
  */
  @IsOptional()
  @IsBoolean()
  maintenanceExtra?: boolean;

  /*
  ==============================
  RENT NEGOTIABLE
  ==============================
  */
  @IsOptional()
  @IsBoolean()
  rentNegotiable?: boolean;

  /*
  ==============================
  DEPOSIT NEGOTIABLE
  ==============================
  */
  @IsOptional()
  @IsBoolean()
  depositNegotiable?: boolean;

  /*
  ==============================
  LEASE DURATION
  ==============================
  */
  @IsOptional()
  @IsString()
  leaseDuration?: string;

  @IsOptional()
  @IsString()
maintenanceAmount?: number;
  /*
  ==============================
  LOCKIN PERIOD
  ==============================
  */
  @IsOptional()
  @IsString()
  lockinPeriod?: string;

  /*
  ==============================
  AVAILABLE FROM
  ==============================
  */
  @IsOptional()
  @IsString()
  availableFrom?: string;

  /*
  ==============================
  IDEAL FOR
  ==============================
  */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  idealFor?: string[];

  /*
  ==============================
  TAGS
  ==============================
  */
  @IsOptional()
  @IsString()
  addOthertags?: string;
  rentType: any;
}