import {
  IsOptional,
  IsNumber,
  IsBoolean
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreatePriceDto {

  /*
  ==============================
  RENT
  ==============================
  */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent?: number;


  /*
  ==============================
  MAINTENANCE
  ==============================
  */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maintenance?: number;


  /*
  ==============================
  DEPOSIT
  ==============================
  */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deposit?: number;


  /*
  ==============================
  RENT NEGOTIABLE
  ==============================
  */

  @IsOptional()
  @IsBoolean()
  rentNegotiable?: boolean;

}