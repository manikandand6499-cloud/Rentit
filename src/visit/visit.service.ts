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

  // 🔥 1. VALIDATE propertyId FIRST
  if (!propertyId) {
    throw new BadRequestException("propertyId is required");
  }

  // 🔥 2. CHECK PROPERTY EXISTS
  const property = await this.prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundException("Property not found");
  }

  // 🔥 3. VALIDATE INPUT
  if (!date) {
    throw new BadRequestException("Date is required");
  }

  if (!time) {
    throw new BadRequestException("Time is required");
  }

  // 🔥 4. HANDLE TIME FORMAT
  let selectedTime24 = time;

  if (time.includes("AM") || time.includes("PM")) {
    selectedTime24 = this.convertTo24Hour(time);
  }

  // 🔥 5. PREVENT PAST BOOKING
  const now = new Date();
  const visitDateTime = new Date(`${date}T${selectedTime24}`);

  if (visitDateTime < now) {
    throw new BadRequestException("Cannot book past time ⛔");
  }

  // 🔥 6. SLOT CONFLICT CHECK
  const existing = await this.prisma.visit.findFirst({
    where: {
      propertyId,
      date,
      time: selectedTime24,
    },
  });

  if (existing) {
    throw new BadRequestException(
      "This time slot already booked macha ⚠️"
    );
  }

  // 🔥 7. CREATE VISIT
  return this.prisma.visit.create({
    data: {
      userId,
      propertyId,
      date,
      time: selectedTime24,
    },
  });
}
}