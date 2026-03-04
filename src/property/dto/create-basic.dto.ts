import { IsString } from 'class-validator';

export class CreateBasicDto {
  @IsString()
  city: string;

  @IsString()
  propertyType: string;
  propertyType2: string;
}