import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetailsDto {
  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  ownershipType?: string;

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
  @IsArray()
  @IsString({ each: true })
  preferredTenant?: string[];

  @IsOptional()
  @IsString()
  rulesAndRegulation?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roomType?: string[];

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