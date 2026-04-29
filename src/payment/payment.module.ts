// payment.module.ts

import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpay.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [RazorpayService, PrismaService],
  controllers: [PaymentController],
})
export class PaymentModule {}