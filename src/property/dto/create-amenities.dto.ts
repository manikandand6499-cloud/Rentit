// create-amenities.dto.ts

import { IsObject, IsOptional, IsBoolean, IsString } from "class-validator";

export class CreateAmenitiesDto {

  @IsOptional()
  parking?: any;

  @IsOptional()
  restrictions?: any;

  @IsOptional()
  @IsObject()
  furnishing?: any;

  @IsOptional()
  societyAmenities?: any;

  @IsOptional()
  roomAmenities?: any;

  @IsOptional()
  foodType?: any;

  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;

  @IsOptional()
  @IsBoolean()
  petAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  nonVegAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  gatedCommunity?: boolean;

  @IsOptional()
  @IsBoolean()
  gateSecurity?: boolean;

  @IsOptional()
  noOfFloors?: string;

  @IsOptional()
  noOfBalcony?: string;

  @IsOptional()
  @IsBoolean()
  laundry?: boolean;

  @IsOptional()
  @IsBoolean()
  roomCleaning?: boolean;

  @IsOptional()
  @IsBoolean()
  warden?: boolean;

  // 🔥 FIXED FIELDS
  @IsOptional()
  isBusinessRunning?: any;

  @IsOptional()
  propertyCondition?: any;

  @IsOptional()
  @IsBoolean()
  unitsPropertiesavailaible?: boolean;

  @IsOptional()
  @IsString()
  directions?: string;
}