import {
  IsOptional,
  IsString,
  IsBoolean,
  IsArray
} from "class-validator";

export class CreateAdditionalDetailsDto {

  @IsOptional()
  bathroom?: string;

  @IsOptional()
  noOfBalcony?: string;

  @IsOptional()
  waterSupply?: any;

  @IsOptional()
  @IsBoolean()
  petAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  GymAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  nonVegAllowed?: boolean;

@IsOptional()
@IsString()
rentType?: string; 

  @IsOptional()
  @IsBoolean()
  gateSecurity?: boolean;

  @IsOptional()
  @IsString()
  shownBy?: string;

  @IsOptional()
  propertyCondition?: any;

  @IsOptional()
  @IsString()
  secondaryNumber?: string;

  @IsOptional()
  unitsPropertiesavailaible?: boolean;

  @IsOptional()
  @IsString()
  directions?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}