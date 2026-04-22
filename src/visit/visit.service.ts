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

  async createVisit(userId: number, dto: CreateVisitDto) {
    const { propertyId, date, time } = dto;

    // 🔥 1. VALIDATE INPUT
    if (!propertyId) {
      throw new BadRequestException("propertyId required");
    }

    if (!date || !time) {
      throw new BadRequestException("Date & Time required");
    }

    // 🔥 2. CHECK PROPERTY
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (!property.availableFrom) {
      throw new BadRequestException("Property not available yet");
    }

    // 🔥 3. DATE RANGE (15 DAYS)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableFrom = new Date(property.availableFrom);
    availableFrom.setHours(0, 0, 0, 0);

    // start = max(today, availableFrom)
    const start = today > availableFrom ? today : availableFrom;

    const end = new Date(start);
    end.setDate(start.getDate() + 15);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < start || selectedDate > end) {
      throw new BadRequestException(
        "Date must be within available range (15 days)"
      );
    }

    // 🔥 4. TIME CONVERT
    let selectedTime24 = time;

    if (time.includes("AM") || time.includes("PM")) {
      selectedTime24 = this.convertTo24Hour(time);
    }

    console.log("⏱ FINAL TIME:", selectedTime24);

    // 🔥 5. TIME RANGE (7AM–10PM)
    const hour = parseInt(selectedTime24.split(":")[0]);

    if (hour < 7 || hour > 22) {
      throw new BadRequestException("Allowed time: 7AM to 10PM only");
    }

    // 🔥 6. PREVENT PAST TIME
    const visitDateTime = new Date(`${date}T${selectedTime24}`);

    if (visitDateTime < new Date()) {
      throw new BadRequestException("Past time not allowed");
    }

    // 🔥 7. SLOT CONFLICT CHECK
    const exists = await this.prisma.visit.findFirst({
      where: {
        propertyId,
        date,
        time: selectedTime24,
      },
    });

    if (exists) {
      throw new BadRequestException("This time slot already booked");
    }

    // 🔥 8. CREATE VISIT
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