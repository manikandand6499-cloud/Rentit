import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

/// ================= ROOM =================
export class RoomDto {
  @IsOptional()
  @IsString()
  sharing?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

/// ================= FOOD =================
export class FoodTypeDto {
  @IsOptional()
  @IsBoolean()
  breakfast?: boolean;

  @IsOptional()
  @IsBoolean()
  lunch?: boolean;

  @IsOptional()
  @IsBoolean()
  dinner?: boolean;
}

/// ================= PG AMENITIES =================
export class AmenitiesDto {
  @IsOptional() @IsBoolean() laundry?: boolean;
  @IsOptional() @IsBoolean() roomCleaning?: boolean;
  @IsOptional() @IsBoolean() wifi?: boolean;
  @IsOptional() @IsBoolean() commonTV?: boolean;
  @IsOptional() @IsBoolean() lift?: boolean;
  @IsOptional() @IsBoolean() powerBackup?: boolean;
  @IsOptional() @IsBoolean() refrigerator?: boolean;
  @IsOptional() @IsBoolean() mess?: boolean;
}

/// ================= RESTRICTIONS =================
export class RestrictionsDto {
  @IsOptional() @IsBoolean() smoking?: boolean;
  @IsOptional() @IsBoolean() drinking?: boolean;
  @IsOptional() @IsBoolean() loudMusic?: boolean;
  @IsOptional() @IsBoolean() nonVegAllowed?: boolean;
  @IsOptional() @IsBoolean() girlsEntry?: boolean;
}