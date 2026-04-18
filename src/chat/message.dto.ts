import { IsString, IsNumber } from 'class-validator';

export class CreateMessageDto {
  @IsNumber()
  senderId!: number;

  @IsNumber()
  receiverId!: number;

  @IsNumber()
  propertyId!: number;

  @IsString()
  message!: string;
}