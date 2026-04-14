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
import { CreateRentDto } from './dto/create-rent.dto';
import { CreateAdditionalDetailsDto } from './dto/create-residential-additional-details.dto';

@Injectable()
export class PropertyService {
  uploadVideoToS3(id: number, userId: any, file: Express.Multer.File) {
    throw new Error('Method not implemented.');
  }
  uploadImagesToS3(id: number, userId: any, files: Express.Multer.File[]) {
    throw new Error('Method not implemented.');
  }

  constructor(private prisma: PrismaService) { }

  /*
  ============================================================
  STEP 1 — CREATE BASIC
  ============================================================
  */
  async createBasic(userId: number, data: CreateBasicDto) {
    return this.prisma.property.create({
      data: {
        userId: userId,           // ✅ MUST
        city: "Chennai",          // ⚠️ TEMP (or take from frontend)

        propertyType: data.propertyType,
        propertyType2: data.propertyType2 ?? "",
        propertyAge: data.propertyAge,
        buildingType: data.buildingType,
        floor: data.floor,
        totalFloor: data.totalFloor,
        builtUpArea: data.builtUpArea,

        furnishing: data.furnishing ?? undefined,
        otherFeatures: data.otherFeatures,

        currentStep: 2,
      }
    });
  }

  /*
  ============================================================
  STEP 2 — PROPERTY DETAILS
  ============================================================
  */
  async updateDetails(
    id: number,
    userId: number,
    data: CreateDetailsDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    console.log("DTO DATA:", data);

    return this.prisma.property.update({
      where: { id },
      data: {

        // 🔥 LOCATION
        rentType: data.rentType,
        city: data.city ?? undefined,
        street: data.street ?? undefined,
        locality: data.locality ?? undefined,
        landmark: data.landmark ?? undefined,

        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        facing: data.facing ?? undefined,

        // 🔥 BASIC DETAILS
        propertyType2: data.propertyType2 ?? "",
        buildingType: data.buildingType ?? undefined,
        propertyAge: data.propertyAge ?? undefined,
        floor: data.floor ?? undefined,
        totalFloor: data.totalFloor ?? undefined,
        builtUpArea: data.builtUpArea ?? undefined,

        furnishing: data.furnishing ?? undefined,
        otherFeatures: data.otherFeatures ?? undefined,

        // 🔥 DATE / TIME
        availableFrom: data.availableFrom
          ? new Date(data.availableFrom)
          : undefined,

        gateClosingTime: data.gateClosingTime
          ? new Date(`1970-01-01T${data.gateClosingTime}:00`)
          : undefined,

        // 🔥 PG DETAILS (IMPORTANT)
        placeisavailablefor: data.placeisavailablefor ?? undefined,
        preferredTenant: data.preferredTenant ?? undefined,
        foodIncluded: data.foodIncluded ?? undefined,

        // 🔥 EXTRA DETAILS
        rulesAndRegulation: data.rulesAndRegulation ?? undefined,
        description: data.description ?? undefined,

        // 🔥 JSON FIELD
        foodType: data.foodType
          ? { list: data.foodType }
          : undefined,

        // 🔥 OPTIONAL
        roomType: data.roomType ?? undefined,

        currentStep: 2,
      },
    });
  }
/*
============================================================
GET ALL PROPERTIES
============================================================
*/
async getAllProperties(
  lat?: number,
  lng?: number,
  city?: string,
  locality?: string,
  propertyType?: string,
) {
  const where: any = {
    isDeleted: false,
  };

  if (city) {
    where.city = { contains: city };
  }

  if (locality) {
    where.locality = { contains: locality };
  }

  if (propertyType) {
    where.propertyType = propertyType;
  }

  const properties = await this.prisma.property.findMany({
    where,
    select: {
      id: true,
      city: true,
      rent: true,
      locality: true,
      createdAt: true,
      latitude: true,
      longitude: true,
      propertyType: true,
      images: true, // ✅ kept best version
    },
    orderBy: { createdAt: 'desc' },
  });

  // 👉 If no location → return directly
  if (!lat || !lng) return properties;

  // 👉 Sort by nearest location
  const withCoords = properties
    .filter(p => p.latitude && p.longitude)
    .sort((a, b) => {
      const distA = this.haversine(lat, lng, a.latitude!, a.longitude!);
      const distB = this.haversine(lat, lng, b.latitude!, b.longitude!);
      return distA - distB;
    });

  const withoutCoords = properties.filter(
    p => !p.latitude || !p.longitude,
  );

  return [...withCoords, ...withoutCoords];
}

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +

      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }



  async getMyProperties(userId: number) {
    return this.prisma.property.findMany({
      where: {
        userId,
        // include deleted also (dashboard needs it)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }


  async getPublishedProperties() {
    return this.prisma.property.findMany({
      where: {
        isDraft: false,
        currentStep: 7,
        isDeleted: false, // ✅ MUST
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }


  /*
  ============================================================
  STEP 3 — AMENITIES
  ============================================================
  */
  async updateAmenities(
    id: number,
    userId: number,
    data: CreateAmenitiesDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        parking: data.parking,
        furnishing: data.furnishing,
        gateSecurity: data.gateSecurity,
        restrictions: data.restrictions,
        societyAmenities: data.societyAmenities,

        roomAmenities: data.roomAmenities
          ? { list: data.roomAmenities }
          : undefined,

        // ✅ ADD THESE 3 LINES
        laundry: data.laundry,
        roomCleaning: data.roomCleaning,
        warden: data.warden,

        foodIncluded: data.foodIncluded,
        petAllowed: data.petAllowed,
        nonVegAllowed: data.nonVegAllowed,
        gatedCommunity: data.gatedCommunity,
        noOfFloors: data.noOfFloors,
        noOfBalcony: data.noOfBalcony,
        currentStep: 3,
        foodType: data.foodType,

        isBusinessRunning: data.isBusinessRunning ?? undefined,
        propertyCondition: data.propertyCondition ?? undefined,
        unitsPropertiesavailaible: data.unitsPropertiesavailaible,
        setDirection: data.directions ? data.directions : undefined,


      }
    });
  }

  /*
  ============================================================
  STEP 4 — PRICE
  ============================================================
  */
  async updatePrice(
    id: number,
    userId: number,
    data: CreatePriceDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        expectedRent: data.expectedRent,
        deposit: data.deposit,
        rentType: data.rentType,
        rentNegotiable: data.rentNegotiable,
        depositNegotiable: data.depositNegotiable,
        maintenanceExtra: data.maintenanceExtra,
        maintenanceAmount:
          data.maintenanceAmount !== undefined &&
            data.maintenanceAmount !== null
            ? String(data.maintenanceAmount)
            : undefined,

        leaseDuration: data.leaseDuration,

        // 🔥 FIX HERE

        availableFrom: data.availableFrom
          ? new Date(data.availableFrom)
          : undefined,

        // 🔥 FIX HERE
        lockinPeriod: data.lockinPeriod,
        IdealFor: data.idealFor,

        addOthertags: data.addOthertags,

        currentStep: 4,
      }
    });
  }

  /*
  ============================================================
  STEP 5 — IMAGES
  ============================================================
  */
  async saveImages(
    id: number,
    userId: number,
    images: string[],
  ) {
    await this.checkPropertyOwner(id, userId);

    // get existing images (for deletion purpose)
    const property = await this.prisma.property.findUnique({
      where: { id },
      select: { images: true },
    });

    const oldImages = property?.images || [];

    // clean new images
    const cleanImages = images.filter(
      (img) => typeof img === "string" && img.trim() !== ""
    );

    // 🔥 find removed images
    const removedImages = oldImages.filter(
      (img) => !cleanImages.includes(img)
    );

    // 🔥 OPTIONAL: delete files from server
    const fs = require("fs");
    removedImages.forEach((img) => {
      fs.unlink(img, (err) => {
        if (err) console.log("Delete error:", err);
      });
    });

    // ✅ FINAL SAVE (REPLACE)
    return this.prisma.property.update({
      where: { id },
      data: {
        images: cleanImages, // 💯 replace full list
        currentStep: 5,
      },
    });
  }

  /*
  ============================================================
  STEP 5 (OPTIONAL) — VIDEO
  ============================================================
  */
  async saveVideo(
    id: number,
    userId: number,
    video: string,
  ) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: { video },
    });
  }

  /*
  ============================================================
  STEP 6 — CONTACT
  ============================================================
  */
  async updateContact(
    id: number,
    userId: number,
    data: CreateContactDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        contactName: data.contactName,
        mobileNo: data.mobileNo,
        repliesWithin: data.repliesWithin,
        whatsapp: data.whatsapp,
        currentStep: 6,
      },
    });
  }

  /*
  ============================================================
  STEP 7 — VERIFY & PUBLISH
  ============================================================
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
  ============================================================
  GET SINGLE PROPERTY
  ============================================================
  */
  async getProperty(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  /*
  ============================================================
  OWNER VALIDATION
  ============================================================
  */
  private async checkPropertyOwner(
    id: number,
    userId: number,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.userId !== userId) {
      throw new UnauthorizedException(
        'You are not allowed to edit this property',
      );
    }
  }




  async updateLocation(id: number, userId: number, data: UpdateLocationDto) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  async deleteProperty(id: number, userId: number) {
    const property = await this.prisma.property.findUnique({ where: { id } });

    if (!property) throw new NotFoundException('Property not found');

    if (property.userId !== userId) {
      throw new UnauthorizedException('Not allowed');
    }

    if (property.isDeleted) {
      throw new Error('Already deleted'); // optional
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async reactivateProperty(id: number, userId: number) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

async updateAvailability(
  id: number,
  userId: number,
  data: UpdateAvailabilityDto,
) {
  await this.checkPropertyOwner(id, userId);

  return this.prisma.property.update({
    where: { id },
    data: {
      availabilityDay: data.availabilityDay,

      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,

      availableAllDay: data.availableAllDay, // ✅ ADD THIS LINE

      currentStep: 3,
    },
  });
}

  async updateAdditional(
    id: number,
    userId: number,
    data: CreateAdditionalDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    return this.prisma.property.update({
      where: { id },
      data: {

        propertyDescription: data.propertyDescription,

        // optional (if you add later in DB)
        shownBy: data.shownBy,
        occupancy: data.previousOccupancy,

        // 🔥 convert string → boolean
        propertypainted:
          data.propertypainted === "Yes"
            ? true
            : data.propertypainted === "No"
              ? false
              : undefined,

        propertycleaned:
          data.propertycleaned === "Yes"
            ? true
            : data.propertycleaned === "No"
              ? false
              : undefined,

        SecondmobileNo: data.secondaryNumber,

        currentStep: 5,
      },
    });
  }


  async updateRent(
    id: number,
    userId: number,
    data: CreateRentDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    console.log("RENT DTO:", data);

    return this.prisma.property.update({
      where: { id },
      data: {
        rentType: data.rentType,
        expectedRent: data.expectedRent,
        deposit: data.deposit,
        maintenanceAmount:
          data.maintenanceAmount !== undefined
            ? data.maintenanceAmount.toString()
            : undefined,

        rentNegotiable: data.rentNegotiable,

        // 🔥 maintenance JSON
        monthlyMaintenance: data.maintenance
          ? { value: data.maintenance }
          : undefined,

        // 🔥 date convert
        availableFrom: data.availableFrom
          ? new Date(data.availableFrom)
          : undefined,

        // 🔥 array
        preferredTenant: data.preferredTenant ?? undefined,

        // 🔥 JSON fields
        furnishing: data.furnishing ?? undefined,
        parking: data.parking ?? undefined,

        // 🔥 description
        description: data.description,

        currentStep: 4,
      },
    });
  }

  async updateAdditionalDetails(
    id: number,
    userId: number,
    data: CreateAdditionalDetailsDto,
  ) {
    await this.checkPropertyOwner(id, userId);

    console.log("ADDITIONAL DETAILS:", data);

    return this.prisma.property.update({
      where: { id },
      data: {
        rentType: data.rentType,
        bathroom: data.bathroom,
        noOfBalcony: data.noOfBalcony,

        waterSupply: data.waterSupply ?? undefined,

        petAllowed: data.petAllowed,
        GymAllowed: data.GymAllowed,
        nonVegAllowed: data.nonVegAllowed,
        gateSecurity: data.gateSecurity,

        shownBy: data.shownBy,

        propertyCondition: data.propertyCondition ?? undefined,

        SecondmobileNo: data.secondaryNumber,

        unitsPropertiesavailaible:
          data.unitsPropertiesavailaible !== undefined
            ? { value: data.unitsPropertiesavailaible }
            : undefined,

        setDirection: data.directions,

        // 🔥 amenities JSON
        societyAmenities: data.amenities
          ? { list: data.amenities }
          : undefined,

        currentStep: 6,
      },
    });
  }


  

  async searchLocations(query: string) {
    if (!query) return [];

    const data = await this.prisma.property.findMany({
      where: {
        OR: [
          { city: { contains: query, mode: 'insensitive' } },
          { locality: { contains: query, mode: 'insensitive' } },
          { street: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        city: true,
        locality: true,
        street: true,
      },
      take: 10,
    });

    // 🔥 FULL ADDRESS FORMAT
    const results = data.map(d => {
      return [d.locality, d.street, d.city]
        .filter(Boolean)
        .join(", ");
    });

    // remove duplicates
    return [...new Set(results)];
  }

}


