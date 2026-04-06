// create-details.dto.ts
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

  @IsOptional()
  @IsString()
  propertyName?: string;

    @IsOptional()
  @IsString()
  buildingType?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ownershipType?: string[];

  @IsOptional()
  @IsString()
  bhkType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  floor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalFloor?: number;

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
 
    @IsOptional()
  @IsObject()
  otherFeatures?: any;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];

  @IsOptional()
  @IsString()
  rulesAndRegulation?: string;

  @IsOptional()
  roomType?: {
    type: string[];
    rent?: number;
    deposit?: number;
  }[];

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
 


  // ✅ IMPORTANT FIELDS
  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;

  @IsOptional()
  foodType?: any;

  @IsOptional()
  @IsString()
  gateClosingTime?: string;

  @IsOptional()
  furnishing?: any;

  @IsOptional()
  @IsArray()
  placeisavailablefor?: string[];

@IsOptional()
@IsString()
propertyType2?: string;

@IsOptional()
@IsString()
city?: string;

@IsOptional()
@IsNumber()
latitude?: number;

@IsOptional()
@IsNumber()
longitude?: number;
  rentType: any;
}