import { IsOptional, IsString } from "class-validator";

export class CreateBasicDto {

  @IsString()
  propertyType!: string;   // ✅ REQUIRED (no undefined)

  @IsOptional()
  @IsString()
  propertyName?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  locality?: string; // 🔥 ADD THIS (REQUIRED in DB)

  


}