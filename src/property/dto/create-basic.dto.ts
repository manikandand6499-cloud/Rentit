import { IsOptional, IsString } from "class-validator";

export class CreateBasicDto {

  @IsString()
  propertyType: string | undefined;   // ✅ required

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gender?: string;  // Boys / Girls / Co-living
}