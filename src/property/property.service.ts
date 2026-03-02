import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBasicDto } from './dto/create-basic.dto';
import { CreateDetailsDto } from './dto/create-details.dto';
import { CreateAmenitiesDto } from './dto/create-amenities.dto';
import { CreatePriceDto } from './dto/create-price.dto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async createBasic(data: CreateBasicDto) {
    return this.prisma.property.create({
      data: {
        city: data.city,
        propertyType: data.propertyType,
        currentStep: 1,
      },
    });
  }

  async updateDetails(id: number, data: CreateDetailsDto) {
    await this.checkProperty(id);

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

async updateAmenities(id: number, data: CreateAmenitiesDto) {
  await this.checkProperty(id);

  return this.prisma.property.update({
    where: { id },
    data: {
      parking: data.parking,
      gateSecurity: data.gateSecurity,
      furnishing: data.furnishing,
      currentStep: 3,
    },
  });
}
async verifyProperty(id: number) {
  await this.checkProperty(id);

  return this.prisma.property.update({
    where: { id },
    data: {
      currentStep: 7,
      isDraft: false,
    },
  });
}
  async updatePrice(id: number, data: CreatePriceDto) {
    await this.checkProperty(id);

    return this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        currentStep: 4,
        isDraft: false,
      },
    });
  }

  async getProperty(id: number) {
    return this.prisma.property.findUnique({
      where: { id },
    });
  }
async saveImages(id: number, images: string[]) {
  await this.checkProperty(id);

  return this.prisma.property.update({
    where: { id },
    data: {
      images,
      currentStep: 5,
    },
  });
}

async saveVideo(id: number, video: string) {
  await this.checkProperty(id);

  return this.prisma.property.update({
    where: { id },
    data: {
      video,
    },
  });
}


  private async checkProperty(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }
  }
}