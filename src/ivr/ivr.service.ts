import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';
import dayjs from 'dayjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IvrService {
  private client;

  constructor(private prisma: PrismaService) {
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // 🔥 CALL USER
  async callUser(visitId: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { user: true, property: true },
    });

    if (!visit) return;

    await this.client.calls.create({
      to: visit.user.mobile,
      from: process.env.TWILIO_PHONE,
      url: `${process.env.BASE_URL}/ivr/start?bookingId=${visit.id}`,
    });

    console.log("📞 CALL TRIGGERED:", visit.user.mobile);
  }
}