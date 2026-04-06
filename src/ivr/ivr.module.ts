import { Module } from '@nestjs/common';
import { IvrService } from './ivr.service';
import { IvrController } from './ivr.controller';
import { IvrScheduler } from './ivr.scheduler';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [IvrController],
  providers: [IvrService, IvrScheduler, PrismaService],
})
export class IvrModule {}