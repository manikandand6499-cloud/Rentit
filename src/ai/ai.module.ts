// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [AiController],
  providers: [AiService, PrismaService],
})
export class AiModule {}