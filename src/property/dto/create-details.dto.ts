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

  // 🏠 BASIC
  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  // 👥 PREFERENCES
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredGuests?: string[];

  // 📍 LOCATION
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
@IsArray()
roomType?: any[];

  @IsOptional()
  @IsObject()
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
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsObject()
  foodType?: any;

  @IsOptional()
  @IsObject()
  pgAmenities?: any;

  @IsOptional()
  @IsObject()
  restrictions?: any;

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