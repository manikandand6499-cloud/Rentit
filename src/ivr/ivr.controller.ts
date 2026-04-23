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
import { IvrService } from './ivr.service';
import { VisitStatus } from '@prisma/client';

@Controller('ivr')
export class IvrController {
  constructor(
    private prisma: PrismaService,
    private ivrService: IvrService,
  ) {}

  // 🔥 FORCE CALL (TEST)
  @Get('force-call')
  async forceCall() {
    console.log("🔥 FORCE CALL TRIGGERED");
    await this.ivrService.callUser(1);
    return "calling...";
  }

  // 🎯 START IVR CALL
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

    return res.type('text/xml').send(`
<Response>
  <GetDigits timeout="10" numDigits="1"
    action="${process.env.BASE_URL}/ivr/handle?bookingId=${bookingId}"
    method="POST">
    <Say>${message}</Say>
  </GetDigits>

  <Say>No input received</Say>
</Response>
    `);
  }

  // 🎯 HANDLE USER INPUT (FINAL FIXED)
  @Post('handle')
  async handle(
    @Body() body: any,
    @Query('bookingId') bookingId: number,
    @Res() res: Response,
  ) {
    const digit = body.Digits;

    // ✅ USE ENUM (VERY IMPORTANT)
    let status: VisitStatus = VisitStatus.pending;

    if (digit === '1') status = VisitStatus.confirmed;
    else if (digit === '2') status = VisitStatus.cancelled;

    console.log("📲 IVR INPUT:", digit);
    console.log("📊 STATUS:", status);

    await this.prisma.visit.update({
      where: { id: Number(bookingId) },
      data: { status },
    });

    return res.type('text/xml').send(`
<Response>
  <Say>Thank you. Your response is recorded.</Say>
</Response>
    `);
  }

  // 🔥 FORMAT TIME
  private formatTime(time: string): string {
    const [h, m] = time.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

  // 🔥 MESSAGE
  private getMessage(booking: any): string {
    const name = booking.user.name || 'User';
    const time = this.formatTime(booking.time);

    return `Hello ${name}, your visit is at ${time}. Press 1 to confirm, press 2 to cancel.`;
  }
}