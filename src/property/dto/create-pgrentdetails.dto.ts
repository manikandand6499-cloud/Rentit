import { IsArray, IsOptional, IsString } from "class-validator";

export class CreatePgRentDetailsDto {

  @IsOptional()
  @IsArray()
  pgrentdetails?: {
    sharing: string;
    rent: number;
    deposit: number;
    amenities: string[];
  }[];
}