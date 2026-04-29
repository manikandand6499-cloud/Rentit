import { IsArray, IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class RoomDto {
  sharing: string | undefined;
  rent: number | undefined;
  deposit: number | undefined;
  amenities: string[] | undefined;
}

export class CreatePgRentDetailsDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomDto)
  pgrentdetails?: RoomDto[];
}