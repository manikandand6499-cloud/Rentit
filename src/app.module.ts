import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { PropertyModule } from "./property/property.module";

@Module({
  imports: [PrismaModule, AuthModule, PropertyModule],
})
export class AppModule {}