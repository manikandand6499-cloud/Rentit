import { IsOptional, IsBoolean, IsString,   } from "class-validator";
import { Type } from "class-transformer";

export class UpdateAvailabilityDto {

  @IsOptional()
  availabilityDay?: any;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  availableAllDay?: boolean;
}