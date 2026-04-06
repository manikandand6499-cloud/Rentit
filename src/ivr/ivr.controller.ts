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

  // 🔥 START CALL
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
  <Hangup/>
</Response>
      `);
    }

    const message = `
Hello ${booking.user.name || 'User'},
You booked ${booking.property.propertyName || 'property'} 
at ${booking.time}.
Press 1 to confirm.
Press 2 to cancel.
    `;

    return res.type('text/xml').send(`
<Response>
  <Gather 
    numDigits="1" 
    action="${process.env.BASE_URL}/ivr/handle?bookingId=${bookingId}" 
    method="POST"
  >
    <Say>${message}</Say>
  </Gather>

  <Say>No input received</Say>
  <Hangup/>
</Response>
    `);
  }

  // 🔥 HANDLE INPUT
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

    return res.type('text/xml').send(`
<Response>
  <Say>Thank you. Response recorded.</Say>
  <Hangup/>
</Response>
    `);
  }
}