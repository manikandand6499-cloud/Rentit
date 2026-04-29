import { IsString, Length } from "class-validator";

export class VerifyOtpDto {
  @IsString()
  @Length(10, 15)
  mobile: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
