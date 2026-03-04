import { IsOptional, IsBoolean, IsString } from "class-validator";

export class CreateAmenitiesDto {

  @IsOptional()
  parking?: any;

  @IsOptional()
  restrictions?: any;

  @IsOptional()
  furnishing?: any;

  @IsOptional()
  societyAmenities?: any;

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
  @IsString()
  noOfFloors?: string;

  @IsOptional()
  @IsString()
  noOfBalcony?: string;
}