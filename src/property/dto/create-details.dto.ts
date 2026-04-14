import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateDetailsDto {

  // 🏠 BASIC
  @IsOptional()
  @IsString()
  propertyName?: string;


  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  // 📍 LOCATION
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  // 🛏 ROOM
  @IsOptional()
  roomType?: any;

  @IsOptional()
  sharingType?: any;

  // 💰 PRICING
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsBoolean()
  rentNegotiable?: boolean;

  @IsOptional()
  @IsBoolean()
  depositNegotiable?: boolean;

  // 🍽 FACILITIES
  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;

  @IsOptional()
  foodType?: any;

  @IsOptional()
  pgAmenities?: any;

  @IsOptional()
  @IsBoolean()
  wifi?: boolean;

  @IsOptional()
  @IsBoolean()
  powerBackup?: boolean;

  // 🏢 RULES
  @IsOptional()
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @IsBoolean()
  drinking?: boolean;

  @IsOptional()
  @IsBoolean()
  nonVegAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  guardiansStay?: boolean;

  // ⏰ AVAILABILITY
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  noticePeriod?: number;

  @IsOptional()
  @IsString()
  gateClosingTime?: string;
}