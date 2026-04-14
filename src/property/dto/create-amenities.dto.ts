import { IsOptional, IsBoolean, IsObject } from "class-validator";

export class CreateAmenitiesDto {

  // 🍽 FOOD
  @IsOptional()
  @IsBoolean()
  foodIncluded?: boolean;


 @IsOptional()
  @IsBoolean()
  parking?: boolean;
  
  @IsOptional()
  @IsObject()
  foodType?: Record<string, any>;

  // 🏠 ALL AMENITIES (BEST APPROACH)
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



    @IsOptional()
  @IsObject()
  restrictions?: {
    Smoking?: boolean;
    Alcohol?: boolean;
    LoudMusic?: boolean;
    NonVeg?: boolean;
    GirlsEntry?: boolean;
  };
  

  // 🏢 RULES
  @IsOptional()
  @IsBoolean()
  nonVegAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  drinking?: boolean;

  @IsOptional()
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @IsBoolean()
  guardiansStay?: boolean;
  
  @IsOptional()
  @IsObject()
  propertyDescription?: string;

}