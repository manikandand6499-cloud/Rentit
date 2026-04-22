import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { PropertyModule } from "./property/property.module";
import { LikeModule } from "./like/like.module";
import { UserModule } from "./user/user.module";
import { PaymentModule } from "./payment/payment.module";
import { VisitModule } from "./visit/visit.module";
import { ChatModule } from "./chat/chat.module";
import { IvrModule } from "./ivr/ivr.module";

@Module({
  imports: [
    // 🔥 SCHEDULER FIRST (best practice)
    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    PropertyModule,
    LikeModule,
    UserModule,
    PaymentModule,
    VisitModule,
    ChatModule,
    IvrModule, // ✅ IVR included
  ],
})
export class AppModule {}