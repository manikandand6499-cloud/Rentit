import { IsString, Length } from "class-validator";

export class SendOtpDto {
  @IsString()
  @Length(10, 15)
  mobile: string;
}
