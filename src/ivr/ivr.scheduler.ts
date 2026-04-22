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
        isCalled: false, // ✅ avoid duplicate
      },
    });

    const now = dayjs();

    console.log("🕒 CURRENT TIME:", now.format('YYYY-MM-DD HH:mm'));

    for (const visit of visits) {
      const visitDateTime = dayjs(
        `${visit.date} ${visit.time}`,
        'YYYY-MM-DD HH:mm'
      );

      const diff = visitDateTime.diff(now, 'minute');

      console.log(`📊 Visit ${visit.id}`);
      console.log("👉 Visit Time:", visitDateTime.format('YYYY-MM-DD HH:mm'));
      console.log("👉 Diff (min):", diff);

      // 🎯 CALL 1 HOUR BEFORE (TEST: change to 5 mins)
      if (diff <= 2 && diff >= 0) {
        console.log("🚀 Calling user...");

        try {
          await this.ivrService.callUser(visit.id);

          await this.prisma.visit.update({
            where: { id: visit.id },
            data: {
              status: 'calling',
              isCalled: true,
            },
          });

          console.log("✅ Call triggered & DB updated");
        } catch (err) {
          console.error("❌ CALL ERROR:", err);
        }
      }
    }
  }
}