import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('ivr')
export class IvrController {
  constructor(private prisma: PrismaService) {}

  // 🎯 START CALL FLOW (EXOTEL)
  @Get('start')
  async start(
    @Query('bookingId') bookingId: number,
    @Res() res: Response,
  ) {
    const booking = await this.prisma.visit.findUnique({
      where: { id: Number(bookingId) },
      include: { user: true, property: true },
    });

    if (!booking) {
      return res.type('text/xml').send(`
<Response>
  <Say>Invalid booking</Say>
</Response>
      `);
    }

    const message = this.getMessage(booking);

    // ✅ EXOTEL FORMAT
    return res.type('text/xml').send(`
<Response>
  <GetDigits 
    timeout="10" 
    numDigits="1" 
    action="${process.env.BASE_URL}/ivr/handle?bookingId=${bookingId}" 
    method="POST"
  >
    <Say>${message}</Say>
  </GetDigits>

  <Say>No input received</Say>
</Response>
    `);
  }

  // 🎯 HANDLE USER INPUT
  @Post('handle')
  async handle(
    @Body() body: any,
    @Query('bookingId') bookingId: number,
    @Res() res: Response,
  ) {
    const digit = body.Digits;

    let status = 'pending';

    if (digit === '1') status = 'confirmed';
    else if (digit === '2') status = 'cancelled';

    await this.prisma.visit.update({
      where: { id: Number(bookingId) },
      data: { status },
    });

    if (digit === '1') {
      await this.notifyOwner(bookingId);
    }

    return res.type('text/xml').send(`
<Response>
  <Say>Thank you. Your response is recorded.</Say>
</Response>
    `);
  }

  // 🔥 FORMAT TIME (IMPORTANT)
  private formatTime(time: string): string {
    const [h, m] = time.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${m} ${ampm}`;
  }

  // 🌍 MESSAGE (SHORT & CLEAR FOR IVR)
  private getMessage(booking: any): string {
    const name = booking.user.name || 'User';
    const time = this.formatTime(booking.time);

    switch (booking.language) {
      case 'ta':
        return `வணக்கம் ${name}, உங்கள் பார்வை நேரம் ${time}. வருவீர்களா? ஆம் என்றால் 1 அழுத்தவும், இல்லை என்றால் 2 அழுத்தவும்.`;

      case 'hi':
        return `नमस्ते ${name}, आपकी विज़िट ${time} पर है। आने के लिए 1 दबाएँ, रद्द करने के लिए 2 दबाएँ।`;

      default:
        return `Hello ${name}, your visit is at ${time}. Press 1 to confirm, press 2 to cancel.`;
    }
  }

  // 🔔 OWNER NOTIFICATION
  private async notifyOwner(bookingId: number) {
    const booking = await this.prisma.visit.findUnique({
      where: { id: bookingId },
      include: { user: true, property: true },
    });

    if (!booking) return;

    console.log(
      `📩 ${booking.user.name} confirmed visit at ${booking.time}`
    );
  }
}