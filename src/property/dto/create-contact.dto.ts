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

  @IsOptional()
@IsBoolean()
whatsappupdates?: boolean;

   @IsOptional()
  laundry?: boolean;

  @IsOptional()
  roomCleaning?: boolean;

  @IsOptional()
  warden?: boolean;

  @IsOptional()
  wifi?: boolean;

  @IsOptional()
  commonTV?: boolean;

  @IsOptional()
  lift?: any;

  @IsOptional()
  powerBackup?: boolean;

  @IsOptional()
  mess?: boolean;

  @IsOptional()
  refrigerator?: boolean;

  @IsOptional()
  cookingAllowed?: boolean;

  @IsOptional()
  parkingType?: any;

  @IsOptional()
  setDirection?: string;
}