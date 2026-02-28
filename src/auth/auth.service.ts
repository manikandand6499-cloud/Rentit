import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { Twilio } from "twilio";

@Injectable()
export class AuthService {
  private twilioClient: Twilio;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {
    this.twilioClient = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendOtp(mobile: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // delete old OTPs
    await this.prisma.otp.deleteMany({ where: { mobile } });

    // save new OTP
    await this.prisma.otp.create({
      data: {
        mobile,
        otp,
        expiresAt,
      },
    });

    // send sms using Twilio
    await this.twilioClient.messages.create({
      body: `your OTP is : ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`,   // India format
    });

    return { message: "OTP sent successfully" };
  }

  async verifyOtp(mobile: string, otp: string) {
    const record = await this.prisma.otp.findFirst({
      where: { mobile, otp },
    });

    if (!record) {
      throw new UnauthorizedException("Invalid OTP");
    }

    if (record.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP expired");
    }

    // delete OTP after success
    await this.prisma.otp.deleteMany({ where: { mobile } });

    // create user if not exists
    let user = await this.prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { mobile },
      });
    }

    const token = this.jwtService.sign({
      userId: user.id,
      mobile: user.mobile,
    });

    return {
      message: "OTP verified successfully",
      token,
      user,
    };
  }
}
