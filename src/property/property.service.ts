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

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  /*
  ============================================================
  STEP 1 — CREATE BASIC
  ============================================================
  */
  async createBasic(userId: number, data: CreateBasicDto) {
    return this.prisma.property.create({
      data: {
        city: data.city,
        propertyType: data.propertyType,
        propertyType2: data.propertyType2 ?? '',
        userId,
        currentStep: 1,
        isDraft: true,
      },
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

    return this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        availableFrom: data.availableFrom
          ? new Date(data.availableFrom)
          : undefined,
        currentStep: 2,
      },
    });
  }


/*
============================================================
GET ALL PROPERTIES
============================================================
*/
async getAllProperties() {
  return this.prisma.property.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}


async getMyProperties(userId: number) {
  return this.prisma.property.findMany({
    where: {
      userId,
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
        foodIncluded: data.foodIncluded,
        petAllowed: data.petAllowed,
        nonVegAllowed: data.nonVegAllowed,
        gatedCommunity: data.gatedCommunity,
        noOfFloors: data.noOfFloors,
        noOfBalcony: data.noOfBalcony,
        currentStep: 3,
      },
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
        ...data,
        currentStep: 4,
      },
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

    return this.prisma.property.update({
      where: { id },
      data: {
        images,
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
}