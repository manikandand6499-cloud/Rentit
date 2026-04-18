import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { PropertyModule } from "./property/property.module";
import { LikeModule } from "./like/like.module";
import { UserModule } from "./user/user.module";
import { PaymentModule } from "./payment/payment.module";
import { VisitModule } from "./visit/visit.module";

import { ChatModule } from "./chat/chat.module"; // ✅ ADD THIS

import { IvrController } from "./ivr/ivr.controller";
import { IvrService } from "./ivr/ivr.service";
import { IvrScheduler } from "./ivr/ivr.scheduler";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    PropertyModule,
    LikeModule,
    UserModule,
    PaymentModule,
    VisitModule,
    ChatModule, // ✅ IMPORTANT

    ScheduleModule.forRoot(),
  ],

  controllers: [
    IvrController, // ✅ OK
  ],

  providers: [
    IvrService,
    IvrScheduler, // ✅ OK
  ],
})
export class AppModule {}