import { IsOptional, IsObject, IsBoolean, IsString } from "class-validator";

export class CreateAmenitiesDto {
  @IsOptional()
  @IsObject()
  furnishing?: Record<string, number>;

  @IsOptional()
  @IsObject()
  parking?: Record<string, number>;

  @IsOptional()
  @IsObject()
  restrictions?: Record<string, boolean>;

  @IsOptional()
  @IsObject()
  societyAmenities?: Record<string, boolean>;

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
  @IsString() // ✅ Fixed: Schema is String?, not Int
  noOfFloors?: string;

  @IsOptional()
  @IsString() // ✅ Fixed: Schema is String?, not Int
  noOfBalcony?: string;
}