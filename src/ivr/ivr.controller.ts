// import {
//   Controller,
//   Get,
//   Post,
//   Query,
//   Body,
//   Res,
// } from '@nestjs/common';
// import type { Response } from 'express';
// import { PrismaService } from '../../prisma/prisma.service';

// @Controller('ivr')
// export class IvrController {
//   constructor(private prisma: PrismaService) {}

//   // 🎯 START CALL FLOW
//   @Get('start')
//   async start(
//     @Query('bookingId') bookingId: number,
//     @Res() res: Response,
//   ) {
//     const booking = await this.prisma.visit.findUnique({
//       where: { id: Number(bookingId) },
//       include: { user: true, property: true },
//     });

//     if (!booking) {
//       return res.type('text/xml').send(`
// <Response>
//   <Say>Invalid booking</Say>
//   <Hangup/>
// </Response>
//       `);
//     }

//     const message = this.getMessage(booking);

//     return res.type('text/xml').send(`
// <Response>
// <Gather 
//   numDigits="1" 
//   timeout="10"
//   action="${process.env.BASE_URL}/ivr/handle?bookingId=${bookingId}" 
//   method="POST"
// >
// <Say voice="alice" language="ta-IN">${message}</Say>
// </Gather>

// <Say>No input received</Say>
// <Hangup/>
//     <Say>${message}</Say>
//   </Gather>
//   <Say>No input received</Say>
//   <Hangup/>
// </Response>
//     `);
//   }

//   // 🎯 HANDLE RESPONSE
//   @Post('handle')
//   async handle(
//     @Body() body: any,
//     @Query('bookingId') bookingId: number,
//     @Res() res: Response,
//   ) {
//     const digit = body.Digits;

//     let status = 'pending';

//     if (digit === '1') status = 'confirmed';
//     else if (digit === '2') status = 'cancelled';

//     await this.prisma.visit.update({
//       where: { id: Number(bookingId) },
//       data: { status },
//     });

//     // 🔔 Notify owner if YES
//     if (digit === '1') {
//       await this.notifyOwner(bookingId);
//     }

//     return res.type('text/xml').send(`
// <Response>
//   <Say>Thank you. Your response is recorded.</Say>
//   <Hangup/>
// </Response>
//     `);
//   }

//   // 🌍 MULTI LANGUAGE
//   private getMessage(booking: any): string {
//     const name = booking.user.name || 'User';
//     const house = booking.property.propertyName || 'property';
//     const location = booking.property.location || '';
//     const time = booking.time;

//     switch (booking.language) {
//       case 'ta':
//         return `வணக்கம் ${name}, நீங்கள் ${location} பகுதியில் உள்ள ${house} வீட்டை ${time} மணிக்கு பார்க்க திட்டமிட்டுள்ளீர்கள். வருவீர்களா? ஆம் என்றால் 1 அழுத்தவும், இல்லை என்றால் 2 அழுத்தவும்.`;

//       case 'hi':
//         return `नमस्ते ${name}, आपने ${location} में ${house} को ${time} बजे देखने का समय तय किया है। आएंगे? हाँ के लिए 1 दबाएँ, नहीं के लिए 2 दबाएँ।`;

//       default:
//         return `Hello ${name}, you booked ${house} at ${time}. Press 1 to confirm, press 2 to cancel.`;
//     }
//   }

//   // 🔔 OWNER NOTIFICATION
//   private async notifyOwner(bookingId: number) {
//     const booking = await this.prisma.visit.findUnique({
//       where: { id: bookingId },
//       include: { user: true, property: true },
//     });

//     if (!booking) return;

//     console.log(
//       `📩 ${booking.user.name} will visit ${booking.property.propertyName} at ${booking.time}`
//     );

//     // 👉 Add SMS / WhatsApp here later
//   }
// }

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

  // 🎯 START CALL FLOW
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

    const message = this.getMessage(booking);

    // ✅ CLEAN TWILIO XML (VERY IMPORTANT)
    return res.type('text/xml').send(`
<Response>
  <Gather 
    numDigits="1" 
    timeout="10"
    action="${process.env.BASE_URL}/ivr/handle?bookingId=${bookingId}" 
    method="POST"
  >
    <Say voice="alice" language="ta-IN">
      ${message}
    </Say>
  </Gather>

  <Say>No input received</Say>
  <Hangup/>
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

    // 🔔 Notify owner if confirmed
    if (digit === '1') {
      await this.notifyOwner(bookingId);
    }

    return res.type('text/xml').send(`
<Response>
  <Say>Thank you. Your response is recorded.</Say>
  <Hangup/>
</Response>
    `);
  }

  // 🌍 MULTI LANGUAGE MESSAGE
  private getMessage(booking: any): string {
    const name = booking.user.name || 'User';
    const house = booking.property.propertyName || 'property';

    // ✅ FIXED LOCATION
    const location = `${booking.property.city}, ${booking.property.locality}`;

    const time = booking.time;

    switch (booking.language) {
      case 'ta':
        return `வணக்கம் ${name}, நீங்கள் ${location} பகுதியில் உள்ள ${house} வீட்டை ${time} மணிக்கு பார்க்க திட்டமிட்டுள்ளீர்கள். வருவீர்களா? ஆம் என்றால் 1 அழுத்தவும், இல்லை என்றால் 2 அழுத்தவும்.`;

      case 'hi':
        return `नमस्ते ${name}, आपने ${location} में ${house} को ${time} बजे देखने का समय तय किया है। आएंगे? हाँ के लिए 1 दबाएँ, नहीं के लिए 2 दबाएँ।`;

      default:
        return `Hello ${name}, you have scheduled a visit to ${house} at ${location} at ${time}. Press 1 to confirm, press 2 to cancel.`;
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
      `📩 ${booking.user.name} will visit ${booking.property.propertyName} at ${booking.time}`
    );

    // 👉 Future: SMS / WhatsApp / Push
  }
}