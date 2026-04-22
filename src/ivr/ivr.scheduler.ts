import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { PrismaService } from '../../prisma/prisma.service';
import { IvrService } from './ivr.service';

dayjs.extend(customParseFormat);

@Injectable()
export class IvrScheduler {
  constructor(
    private prisma: PrismaService,
    private ivrService: IvrService,
  ) {}

  // ⏱ Runs every minute
  @Cron('* * * * *')
async handleCron() {
  console.log("⏱ Checking visits...");

  const visits = await this.prisma.visit.findMany({
    where: {
      status: 'pending',
      isCalled: false,
    },
  });

  const now = dayjs();

  for (const visit of visits) {
    const visitDateTime = dayjs(
      `${visit.date} ${visit.time}`,
      'YYYY-MM-DD HH:mm'
    );

    const diff = visitDateTime.diff(now, 'minute');

    console.log(`📊 Visit ${visit.id} | Diff: ${diff}`);

    // 🔥 SAFE WINDOW (NO MISS)
    if (diff <= 2 && diff >= -3) {
      console.log("🚀 Calling user...");

      await this.ivrService.callUser(visit.id);

      await this.prisma.visit.update({
        where: { id: visit.id },
        data: {
          status: 'calling',
          isCalled: true,
        },
      });
    }
  }
}
}