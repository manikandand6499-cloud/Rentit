// property.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBasicDto } from './dto/create-basic.dto';
import { CreateDetailsDto } from './dto/create-details.dto';
import { CreateAmenitiesDto } from './dto/create-amenities.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateLocationDto } from './dto/location.dto';
import { UpdateAvailabilityDto } from './dto/availability.dto';
import { CreateAdditionalDto } from './dto/create-additional.dto';
import { CreateAdditionalDetailsDto } from './dto/create-residential-additional-details.dto';
import { CreatePgRentDetailsDto } from './dto/create-pgrentdetails.dto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  /*
  ============================
  STEP 1 — BASIC
  ============================
  */
  async createBasic(userId: number, data: CreateBasicDto) {
    return this.prisma.property.create({
      data: {
        userId,
        city: data.city ?? "Chennai",
        locality: data.locality ?? "Unknown",
        propertyType: data.propertyType || "PG",
        gender: data.gender ?? undefined,
        propertyName: data.propertyName ?? undefined,
        currentStep: 1,
      },
    });
  }

  /*
  ============================
  STEP 2 — DETAILS
  ============================
  */
 async updateDetails(id: number, userId: number, data: CreateDetailsDto) {
  await this.checkPropertyOwner(id, userId);

  return this.prisma.property.update({
    where: { id },
    data: {
      propertyName: data.propertyName ?? undefined,

      preferredTenant: data.preferredTenant ?? undefined,
      preferredGuests: data.preferredGuests ?? undefined,

      city: data.city ?? "Chennai",          // 🔥 FIX
      locality: data.locality ?? "Unknown",  // 🔥 FIX

      availableFrom: data.availableFrom
        ? new Date(data.availableFrom)
        : undefined,

      noticePeriod: data.noticePeriod ?? undefined,

      gateClosingTime: data.gateClosingTime
        ? new Date(`1970-01-01T${data.gateClosingTime}:00`)
        : undefined,

      currentStep: 2,
    },
  });
}

  /*
  ============================
  STEP 3 — PgRentDetails
  ============================
  */
async updatePgRentDetails(
  id: number,
  userId: number,
  data: CreatePgRentDetailsDto,
) {
  await this.checkPropertyOwner(id, userId);

  return this.prisma.property.update({
    where: { id },
    data: {
      pgrentdetails: data.pgrentdetails?.length
  ? data.pgrentdetails.map(room => ({
      sharing: room.sharing,
      rent: room.rent,
      deposit: room.deposit,
      amenities: room.amenities,
    }))
  : undefined,
      currentStep: 3,
    },
  });
}
  /*
  ============================
  STEP 4 — PRICE
  ============================
  */
  async updatePrice(id: number, userId: number, data: CreatePriceDto) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        rent: data.rent ?? undefined,
        deposit: data.deposit ?? undefined,
        rentNegotiable: data.rentNegotiable ?? undefined,
        depositNegotiable: data.depositNegotiable ?? undefined,
        currentStep: 4,
      },
    });
  }

  async updateLocation(id: number, userId: number, data: UpdateLocationDto) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
        currentStep: 1,
      },
    });
  }

  /*
  ============================
  STEP 5 — IMAGES
  ============================
  */
  async saveImages(id: number, userId: number, images: string[]) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        images,
        currentStep: 5,
      },
    });
  }

  async saveVideo(id: number, userId: number, video: string) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: { video },
    });
  }

  /*
  ============================
  STEP 6 — CONTACT
  ============================
  */
  async updateContact(id: number, userId: number, data: CreateContactDto) {
    await this.checkPropertyOwner(id, userId);

   return this.prisma.property.update({
  where: { id },
  data: {
    contactName: data.contactName ?? undefined,
    mobileNo: data.mobileNo ?? undefined,
    whatsapp: data.whatsapp ?? undefined,
    whatsappupdates: data.whatsappupdates ?? undefined,

    currentStep: 7,
    isDraft: false,
  },
});
  }

  /*
  ============================
  STEP 7 — PUBLISH
  ============================
  */
  async verifyProperty(id: number, userId: number) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        currentStep: 7,
        isDraft: false,
      },
    });
  }

  /*
  ============================
  GET METHODS
  ============================
  */
  async getAllProperties() {
    return this.prisma.property.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
  }

 async getMyProperties(userId: number) {
  if (!userId) throw new Error("Unauthorized");

  const properties = await this.prisma.property.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return properties.map(p => ({
    ...p,
    roomType: Array.isArray(p.roomType)
      ? p.roomType
      : p.roomType
      ? [p.roomType]
      : [],
  }));
}

  async getProperty(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) throw new NotFoundException("Property not found");

    return property;
  }

  /*
  ============================
  DELETE
  ============================
  */
  async deleteProperty(id: number, userId: number) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  }

  /*
  ============================
  OWNER CHECK
  ============================
  */
  private async checkPropertyOwner(id: number, userId: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) throw new NotFoundException("Property not found");

    if (property.userId !== userId) {
      throw new UnauthorizedException("Not allowed");
    }
  }
}