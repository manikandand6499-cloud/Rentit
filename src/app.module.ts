import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { PropertyModule } from "./property/property.module";
import { LikeModule } from "./like/like.module";
import { UserModule } from "./user/user.module";
import { PaymentModule } from "./payment/payment.module"; // ✅ ADD THIS
import { VisitModule } from "./visit/visit.module"; // ✅ ADD THIS
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PropertyModule,
    LikeModule,
    UserModule,
    PaymentModule, 
    VisitModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}