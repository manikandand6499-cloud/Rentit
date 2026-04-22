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

import { IvrModule } from "./ivr/ivr.module"; // 🔥 USE MODULE

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PropertyModule,
    LikeModule,
    UserModule,
    PaymentModule,
    VisitModule,
    ChatModule,
    IvrModule, // 🔥 IMPORTANT

    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}