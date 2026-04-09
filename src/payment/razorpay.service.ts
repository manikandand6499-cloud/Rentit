// // razorpay.service.ts
// import { Injectable, BadRequestException } from '@nestjs/common';
// import Razorpay from 'razorpay';
// import * as crypto from 'crypto';
// import { PrismaService } from '../../prisma/prisma.service';

// @Injectable()
// export class RazorpayService {
//   private razorpay: Razorpay;

//   constructor(private prisma: PrismaService) {
//     this.razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID!,
//       key_secret: process.env.RAZORPAY_SECRET!,
//     });
//   }

//   // ✅ CREATE ORDER
//   async createOrder(amount: number) {
//     if (!amount || amount <= 0) {
//       throw new BadRequestException("Invalid amount");
//     }

//     return this.razorpay.orders.create({
//       amount: amount * 100,
//       currency: 'INR',
//       receipt: `receipt_${Date.now()}`,
//     });
//   }

//   // ✅ VERIFY PAYMENT
// async verifyPayment(data: any, req: any) {

//   const userId = req.user.userId; // ✅ FIXED

//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//     planType,
//     amount,
//     propertyType,
//   } = data;

//   const body = `${razorpay_order_id}|${razorpay_payment_id}`;

//   const expectedSignature = crypto
//     .createHmac('sha256', process.env.RAZORPAY_SECRET!)
//     .update(body)
//     .digest('hex');

//   if (expectedSignature !== razorpay_signature) {
//     throw new BadRequestException("Invalid signature");
//   }

//   const user = await this.prisma.user.findUnique({
//     where: { id: Number(userId) },
//   });

//   if (!user) {
//     throw new BadRequestException("User not found");
//   }

//   // deactivate old plans
//   await this.prisma.subscription.updateMany({
//     where: { userId: Number(userId), isActive: true },
//     data: { isActive: false },
//   });

//   // plan duration
//   let days = 30;
//   if (planType === "premium") days = 60;
//   if (planType === "premium+") days = 90;

//   const startDate = new Date();
// const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

//   const subscription = await this.prisma.subscription.create({
//     data: {
//       userId: Number(userId),
//       planType,
//       planDuration: `${days} days`,
//       amount: Number(amount),
//       paymentId: razorpay_payment_id,
//       startDate,
//       expiryDate,
//       isActive: true,
//       propertyType,
//     },
//   });

//   return {
//     success: true,
//     message: "Payment verified & subscription saved 🎉",
//     data: subscription,
//   };
// }
// }




// razorpay.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_SECRET!,
    });
  }

  // ✅ CREATE ORDER
  async createOrder(amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException("Invalid amount");
    }

    return this.razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
  }

  // ✅ VERIFY PAYMENT
async verifyPayment(data: any, req: any) {

  const userId = req.user.userId; // ✅ FIXED

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planType,
    amount,
    propertyType,
  } = data;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET!)
    .update(body)
    .digest('hex');

      console.log("BODY:", body);
  console.log("EXPECTED:", expectedSignature);
  console.log("RECEIVED:", razorpay_signature);
  console.log("DATA:", data);

  if (expectedSignature !== razorpay_signature) {
    throw new BadRequestException("Invalid signature");
  }


  const user = await this.prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    throw new BadRequestException("User not found");
  }

  // deactivate old plans
  await this.prisma.subscription.updateMany({
    where: { userId: Number(userId), isActive: true },
    data: { isActive: false },
  });

  // plan duration
  let days = 30;
  if (planType === "premium") days = 60;
  if (planType === "premium+") days = 90;

  const startDate = new Date();
const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const subscription = await this.prisma.subscription.create({
    data: {
      userId: Number(userId),
      planType,
      planDuration: `${days} days`,
      amount: Number(amount),
      paymentId: razorpay_payment_id,
      startDate,
      expiryDate,
      isActive: true,
      propertyType,
    },
  });

  return {
    success: true,
    message: "Payment verified & subscription saved 🎉",
    data: subscription,
  };
}
}