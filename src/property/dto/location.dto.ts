import { IsNumber } from "class-validator";

export class UpdateLocationDto {
  @IsNumber()
  latitude: number | undefined;

  @IsNumber()
  longitude: number | undefined;
}