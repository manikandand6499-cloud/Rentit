import { IsOptional, IsBoolean, IsObject, IsString } from "class-validator";

export class CreateAmenitiesDto {

  // 🍽 FOOD
  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;

  // 🚗 PARKING
  @IsOptional()
@IsString()
parking?: string;

  // 🍱 FOOD TYPE (JSON)
  @IsOptional()
  @IsObject()
  foodType?: Record<string, any>;

  // 🏠 ALL AMENITIES
  @IsOptional()
  @IsObject()
  pgAmenities?: {
    laundry?: boolean;
    roomCleaning?: boolean;
    wifi?: boolean;
    commonTV?: boolean;
    lift?: boolean;
    powerBackup?: boolean;
    refrigerator?: boolean;
    mess?: boolean;
  };

  // 🚫 RULES (JSON)
  @IsOptional()
  @IsObject()
 restrictions?: {
  smoking?: boolean;
  drinking?: boolean;
  loudMusic?: boolean;
  nonVegAllowed?: boolean;
  girlsEntry?: boolean;
};

  // 📝 DESCRIPTION
  @IsOptional()
  @IsString()
  propertyDescription?: string;
}