import { Injectable } from '@nestjs/common';
import Twilio from 'twilio';
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

  async callUser(visitId: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { user: true, property: true },
    });

    if (!visit) return;

    let mobile = visit.user.mobile;

    if (!mobile.startsWith("+91")) {
      mobile = "+91" + mobile;
    }

    const url = `${process.env.BASE_URL}/ivr/start?bookingId=${visit.id}`;

    console.log("📞 Calling:", mobile);
    console.log("🌍 URL:", url);
    console.log("☎ FROM:", process.env.TWILIO_PHONE_NUMBER);

    try {
      const call = await this.client.calls.create({
        to: mobile,
        from: process.env.TWILIO_PHONE_NUMBER, // ✅ FIXED
        url,
      });

      console.log("✅ CALL SID:", call.sid);
    } catch (err) {
      console.error("❌ TWILIO ERROR:", err instanceof Error ? err.message : String(err));
    }
  }
}