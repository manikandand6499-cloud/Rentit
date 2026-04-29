import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class IvrService {
  constructor(private prisma: PrismaService) {}

  async callUser(visitId: number) {
    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: { user: true, property: true },
    });

    if (!visit) {
      console.log("❌ Visit not found");
      return;
    }

    let mobile = visit.user?.mobile;

    if (!mobile) {
      console.log("❌ Mobile not found in DB");
      return;
    }

    mobile = mobile.replace(/\s+/g, "");

    if (!mobile.startsWith("91")) {
      mobile = "91" + mobile;
    }

    console.log("📱 FINAL MOBILE:", mobile);

    const url = `${process.env.BASE_URL}/ivr/start?bookingId=${visit.id}`;
    console.log("🌍 CALLBACK URL:", url);

    try {
      const response = await axios.post(
        `https://api.exotel.com/v1/Accounts/${process.env.EXOTEL_SID}/Calls/connect.json`,
        null,
        {
          auth: {
            username: process.env.EXOTEL_API_KEY!, // 🔥 FIXED
            password: process.env.EXOTEL_API_TOKEN!,
          },
          params: {
            From: process.env.EXOTEL_CALLER_ID!,
            To: mobile,
            CallerId: process.env.EXOTEL_CALLER_ID!,
            CallType: "trans",
            Url: url,
          },
        }
      );

      console.log("✅ EXOTEL SUCCESS:", response.data);
    } catch (error: any) {
      console.error("❌ EXOTEL ERROR:", error.response?.data || error.message);
    }
  }
}