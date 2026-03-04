import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  mobileNo?: string;

  @IsOptional()
  @IsString()
  repliesWithin?: string;

  @IsOptional()
  @IsBoolean()
  whatsapp?: boolean;
}