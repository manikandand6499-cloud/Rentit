import { IsOptional, IsBoolean } from "class-validator";

export class CreateAmenitiesDto {

  // 🍽 FOOD
  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;

  @IsOptional()
  foodType?: any;

  // 🏠 PG AMENITIES
  @IsOptional()
  pgAmenities?: any;

  // 📶 BASIC FACILITIES
  @IsOptional()
  @IsBoolean()
  wifi?: boolean;

  @IsOptional()
  @IsBoolean()
  powerBackup?: boolean;

  // 🧺 SERVICES
  @IsOptional()
  @IsBoolean()
  laundry?: boolean;

  @IsOptional()
  @IsBoolean()
  roomCleaning?: boolean;

  // 👨‍💼 MANAGEMENT
  @IsOptional()
  @IsBoolean()
  warden?: boolean;

  // 🏢 RULES
  @IsOptional()
  @IsBoolean()
  nonVegAllowed?: boolean;
}