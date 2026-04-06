// visit.service.ts


import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateVisitDto } from "./dto/create-visit.dto";

@Injectable()
export class VisitService {
  constructor(private prisma: PrismaService) {}

  // 🔥 12H → 24H convert
  private convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  // 🔥 CHECK TIME RANGE
  private isWithinRange(
    selected: string,
    start: string,
    end: string
  ): boolean {
    return selected >= start && selected <= end;
  }

  async createVisit(userId: number, dto: CreateVisitDto) {
    const { propertyId, date, time } = dto;

    // 🔥 1. CHECK PROPERTY
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    // 🔥 2. TIME CONVERT
    const selectedTime24 = this.convertTo24Hour(time);

    // 🔥 3. AVAILABILITY CHECK
    if (!property.availableAllDay) {
      if (!property.startTime || !property.endTime) {
        throw new BadRequestException("Owner has not set availability");
      }

      if (
        !this.isWithinRange(
          selectedTime24,
          property.startTime,
          property.endTime
        )
      ) {
        throw new BadRequestException(
          "Selected time is outside allowed range"
        );
      }
    }

    // 🔥 4. SLOT CONFLICT CHECK
    const existing = await this.prisma.visit.findFirst({
      where: {
        propertyId,
        date,
        time,
      },
    });

    if (existing) {
      throw new BadRequestException(
        "This time slot already booked macha ⚠️"
      );
    }

    // 🔥 5. CREATE VISIT
    return this.prisma.visit.create({
      data: {
        userId,
        propertyId,
        date,
        time,
      },
    });
  }
}