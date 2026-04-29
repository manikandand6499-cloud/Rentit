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

  // 🔥 CREATE VISIT (PRO VERSION)
  async createVisit(userId: number, dto: CreateVisitDto) {
    const { propertyId, date, time } = dto;

    // 1️⃣ VALIDATION
    if (!propertyId) {
      throw new BadRequestException("propertyId required");
    }

    if (!date || !time) {
      throw new BadRequestException("Date & Time required");
    }

    // 2️⃣ PROPERTY CHECK
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException("Property not found");
    }

    if (!property.availableFrom) {
      throw new BadRequestException("Property not available yet");
    }

    // 3️⃣ DATE RANGE (15 DAYS)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableFrom = new Date(property.availableFrom);
    availableFrom.setHours(0, 0, 0, 0);

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

    // 4️⃣ TIME CONVERT
    let selectedTime24 = time;

    if (time.includes("AM") || time.includes("PM")) {
      selectedTime24 = this.convertTo24Hour(time);
    }

    console.log("⏱ FINAL TIME:", selectedTime24);

    // 5️⃣ TIME RANGE (7AM–10PM)
    const [h, m] = selectedTime24.split(":");
    const hour = Number(h);

    if (hour < 7 || hour > 22) {
      throw new BadRequestException("Allowed time: 7AM to 10PM only");
    }

    // 6️⃣ PREVENT PAST TIME
    const visitDateTime = new Date(`${date}T${selectedTime24}`);

    if (visitDateTime < new Date()) {
      throw new BadRequestException("Past time not allowed");
    }

    // 🔥 7️⃣ AUTO EXPIRE OLD VISITS
    const oldVisits = await this.prisma.visit.findMany({
      where: {
        userId,
        propertyId,
        status: {
          in: ["pending", "confirmed", "calling"],
        },
      },
    });

   for (const v of oldVisits) {
  if (!v.visitDateTime) continue; // ✅ FIX

  const oldTime = new Date(v.visitDateTime);

  if (oldTime < new Date()) {
    await this.prisma.visit.update({
      where: { id: v.id },
      data: { status: "completed" },
    });
  }
}

    // 🔥 8️⃣ BLOCK MULTIPLE ACTIVE BOOKINGS (VERY IMPORTANT)
    const activeVisit = await this.prisma.visit.findFirst({
      where: {
        userId,
        propertyId,
        status: {
          in: ["pending", "confirmed", "calling"],
        },
      },
    });

    if (activeVisit) {
      throw new BadRequestException(
        "You already scheduled a visit. Complete or cancel first."
      );
    }

    // 9️⃣ SLOT CONFLICT CHECK
    const exists = await this.prisma.visit.findFirst({
      where: {
  propertyId,
  visitDateTime: new Date(`${date}T${selectedTime24}`),
}
    });

    if (exists) {
      throw new BadRequestException("This time slot already booked");
    }

    // 🔟 CREATE VISIT
   return this.prisma.visit.create({
  data: {
    userId,
    propertyId,
    visitDateTime: new Date(`${date}T${selectedTime24}`), // ✅ FIX
    status: "pending",
  },
});
  }

  // 🔥 GET MY VISITS
 async getMyVisits(userId: number) {
  const visits = await this.prisma.visit.findMany({
    where: { userId },
    include: {
      property: true,
      user: true,
    },
    orderBy: {
      visitDateTime: "desc",
    },
  });

  // 🔥 FIX OLD DATA
  return visits.map((v) => {
    if (!v.visitDateTime && v.date && v.time) {
      return {
        ...v,
        visitDateTime: new Date(`${v.date}T${v.time}`),
      };
    }
    return v;
  });
}

  // 🔥 CANCEL VISIT
  async cancelVisit(id: number) {
    return this.prisma.visit.update({
      where: { id },
      data: {
        status: "cancelled",
      },
    });
  }
}