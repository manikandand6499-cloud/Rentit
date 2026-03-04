import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray
} from "class-validator";
import { Type } from "class-transformer";

export class CreateDetailsDto {

  /*
  ==============================
  BASIC PROPERTY INFO
  ==============================
  */

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ownershipType?: string[];   // ✅ FIXED

  @IsOptional()
  @IsString()
  bhkType?: string;


  /*
  ==============================
  FLOOR DETAILS
  ==============================
  */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalFloor?: number;


  /*
  ==============================
  PROPERTY DESCRIPTION
  ==============================
  */

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  builtUpArea?: number;

  @IsOptional()
  @IsString()
  propertyAge?: string;

  @IsOptional()
  @IsString()
  facing?: string;


  /*
  ==============================
  TENANT DETAILS
  ==============================
  */

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  noticePeriod?: number;

  @IsOptional()
  @IsString()
  occupancy?: string;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;


  /*
  ==============================
  PREFERRED TENANT
  ==============================
  */

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];


  /*
  ==============================
  RULES
  ==============================
  */

  @IsOptional()
  @IsString()
  rulesAndRegulation?: string;


  /*
  ==============================
  ROOM TYPE
  ==============================
  */

  @IsOptional()
  roomType?: {
    type: string[];
    rent?: number;
    deposit?: number;
  }[];


  /*
  ==============================
  LOCATION DETAILS
  ==============================
  */

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  pincode?: string;
}