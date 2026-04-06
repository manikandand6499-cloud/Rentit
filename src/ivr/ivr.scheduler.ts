import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { PrismaService } from '../../prisma/prisma.service';
import { IvrService } from './ivr.service';

@Injectable()
export class IvrScheduler {
  constructor(
    private prisma: PrismaService,
    private ivrService: IvrService
  ) {}

  // 🔥 every minute check pannum
  @Cron('* * * * *')
  async handleCron() {
    console.log("⏱ Checking visits...");

    const visits = await this.prisma.visit.findMany({
      where: {
        status: 'pending',
      },
      include: { user: true },
    });

    const now = dayjs();

    for (const visit of visits) {
      const visitDateTime = dayjs(
        `${visit.date} ${visit.time}`,
        'YYYY-MM-DD hh:mm A'
      );

      const diff = visitDateTime.diff(now, 'minute');

      // 🔥 EXACT 60 mins before
      if (diff === 60) {
        await this.ivrService.callUser(visit.id);
      }
    }
  }
}