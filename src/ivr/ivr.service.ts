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

    // 📱 FORMAT MOBILE (IMPORTANT)
    let mobile = visit.user.mobile;

    if (!mobile.startsWith("91")) {
      mobile = "91" + mobile;
    }

    // 🌍 IVR URL
    const url = `${process.env.BASE_URL}/ivr/start?bookingId=${visit.id}`;

    // 🔥 EXOTEL API URL
    const exotelUrl = `https://${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}@api.exotel.com/v1/Accounts/${process.env.EXOTEL_SID}/Calls/connect.json`;

    console.log("📞 EXOTEL CALL START");
    console.log("👉 To:", mobile);
    console.log("👉 From:", process.env.EXOTEL_CALLER_ID);
    console.log("👉 URL:", url);

    try {
      const response = await axios.post(exotelUrl, null, {
        params: {
          From: process.env.EXOTEL_CALLER_ID, // ✅ Your Exophone
          To: mobile, // ✅ 91xxxxxxxxxx
          CallerId: process.env.EXOTEL_CALLER_ID, // 🔥 IMPORTANT
          CallType: "trans", // 🔥 MUST FOR OUTBOUND
          Url: url, // 🔥 Your IVR API
        },
      });

      console.log("✅ EXOTEL SUCCESS:", response.data);
    } catch (error: any) {
      console.error("❌ EXOTEL ERROR:", error.response?.data || error.message);
    }
  }
}