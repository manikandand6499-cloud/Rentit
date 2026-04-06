import { IsOptional, IsObject, IsString } from "class-validator";

export class CreateBasicDto {

  @IsOptional()
  @IsObject()
  furnishing?: any;

  @IsOptional()
  @IsObject()
  otherFeatures?: any;

  @IsString()
  propertyType: string;   // ✅ remove ?

  @IsString()
  propertyType2: string;

  @IsOptional()
  propertyAge?: string;

  @IsOptional()
  floor?: number;

  @IsOptional()
  totalFloor?: number;

  @IsOptional()
  builtUpArea?: number;
  buildingType: any;
}