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
    private ivrService: IvrService
  ) {}

  @Cron('* * * * *')
  async handleCron() {
    console.log("⏱ Checking visits...");

    const visits = await this.prisma.visit.findMany({
      where: { status: 'pending' },
      include: { user: true },
    });

    const now = dayjs();

    for (const visit of visits) {
      const visitDateTime = dayjs(
        `${visit.date} ${visit.time}`,
        'YYYY-MM-DD hh:mm A'
      );

      const diff = visitDateTime.diff(now, 'minute');

      console.log(`📊 Visit ${visit.id} | Diff: ${diff}`);

      // ✅ CALL BEFORE 2 MINUTES
      if (diff <= 2 && diff >= 0) {
        console.log("🚀 Calling user...");

        await this.ivrService.callUser(visit.id);

        await this.prisma.visit.update({
          where: { id: visit.id },
          data: { status: 'calling' },
        });
      }
    }
  }
}