import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

class RoomDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sharing?: string;

  // ✅ ADD THIS
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rent?: number;

  // ✅ ADD THIS
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  deposit?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

class FoodTypeDto {
  @IsOptional()
  @IsBoolean()
  breakfast?: boolean;

  @IsOptional()
  @IsBoolean()
  lunch?: boolean;

  @IsOptional()
  @IsBoolean()
  dinner?: boolean;
}

class AmenitiesDto {
  @IsOptional() @IsBoolean() laundry?: boolean;
  @IsOptional() @IsBoolean() roomCleaning?: boolean;
  @IsOptional() @IsBoolean() wifi?: boolean;
  @IsOptional() @IsBoolean() commonTV?: boolean;
  @IsOptional() @IsBoolean() lift?: boolean;
  @IsOptional() @IsBoolean() powerBackup?: boolean;
  @IsOptional() @IsBoolean() refrigerator?: boolean;
  @IsOptional() @IsBoolean() mess?: boolean;
}

class RestrictionsDto {
  @IsOptional() @IsBoolean() smoking?: boolean;
  @IsOptional() @IsBoolean() drinking?: boolean;
  @IsOptional() @IsBoolean() loudMusic?: boolean;
  @IsOptional() @IsBoolean() nonVegAllowed?: boolean;
  @IsOptional() @IsBoolean() girlsEntry?: boolean;
}

export class CreateDetailsDto {

  /// BASIC
  @IsOptional()
  @IsString()
  propertyName?: string;

  /// PREFERENCES
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredGuests?: string[];





  /// LOCATION
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  // ✅ FIX (important)
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  landmark?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  /// ROOM
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  roomType?: RoomDto[];

  /// FOOD
  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => FoodTypeDto)
  foodType?: FoodTypeDto;

  /// PARKING
  @IsOptional()
  @IsString()
  parking?: string;

  /// AMENITIES
  @IsOptional()
  @ValidateNested()
  @Type(() => AmenitiesDto)
  pgAmenities?: AmenitiesDto;

  /// RESTRICTIONS
  @IsOptional()
  @ValidateNested()
  @Type(() => RestrictionsDto)
  restrictions?: RestrictionsDto;

  /// AVAILABILITY
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

  /// STEP TRACKING
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentStep?: number;
}