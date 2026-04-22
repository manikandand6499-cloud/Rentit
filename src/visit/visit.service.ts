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

  if (!propertyId) throw new BadRequestException("propertyId required");

  const property = await this.prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) throw new NotFoundException("Property not found");

  if (!property.availableFrom) {
    throw new BadRequestException("Property not available yet");
  }

  if (!date || !time) {
    throw new BadRequestException("Date & Time required");
  }

  // 🔥 1. VALID DATE RANGE (15 DAYS LOGIC)
  const today = new Date();
  const start = new Date(property.availableFrom);

  // if today > availableFrom → start = today
  if (today > start) {
    start.setHours(0, 0, 0, 0);
  }

  const end = new Date(start);
  end.setDate(start.getDate() + 15);

  const selectedDate = new Date(date);

  if (selectedDate < start || selectedDate > end) {
    throw new BadRequestException("Date not in allowed range ⚠️");
  }

  // 🔥 2. TIME CONVERT
  let selectedTime24 = time;
  if (time.includes("AM") || time.includes("PM")) {
    selectedTime24 = this.convertTo24Hour(time);
  }

  // 🔥 3. DEFAULT TIME RANGE (7AM–10PM)
  if (selectedTime24 < "07:00" || selectedTime24 > "22:00") {
    throw new BadRequestException("Time outside allowed range ⛔");
  }

  // 🔥 4. PREVENT PAST TIME
  const visitDateTime = new Date(`${date}T${selectedTime24}`);
  if (visitDateTime < new Date()) {
    throw new BadRequestException("Past time not allowed");
  }

  // 🔥 5. SLOT CHECK
  const exists = await this.prisma.visit.findFirst({
    where: {
      propertyId,
      date,
      time: selectedTime24,
    },
  });

  if (exists) {
    throw new BadRequestException("Slot already booked ⚠️");
  }

  // 🔥 6. CREATE
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