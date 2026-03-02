import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Get,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
} from "@nestjs/common";
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import type { Express } from "express";import { PropertyService } from "./property.service";
import { CreateBasicDto } from "./dto/create-basic.dto";
import { CreateDetailsDto } from "./dto/create-details.dto";
import { CreateAmenitiesDto } from "./dto/create-amenities.dto";
import { CreatePriceDto } from "./dto/create-price.dto";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../common/s3.config";
import { v4 as uuid } from "uuid";

@Controller("property")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  // ✅ BASIC
  @Post("basic")
  createBasic(@Body() dto: CreateBasicDto) {
    return this.propertyService.createBasic(dto);
  }

  // ✅ DETAILS
  @Put("details/:id")
  updateDetails(@Param("id") id: string, @Body() dto: CreateDetailsDto) {
    return this.propertyService.updateDetails(Number(id), dto);
  }

  // ✅ AMENITIES
@Put("amenities/:id")
updateAmenities(
  @Param("id") id: string,
  @Body() dto: CreateAmenitiesDto
) {
  return this.propertyService.updateAmenities(Number(id), dto);
}

  // ✅ PRICE
  @Put("price/:id")
  updatePrice(@Param("id") id: string, @Body() dto: CreatePriceDto) {
    return this.propertyService.updatePrice(Number(id), dto);
  }

  // ✅ VERIFY
  @Put("verify/:id")
  verifyProperty(@Param("id") id: string) {
    return this.propertyService.verifyProperty(Number(id));
  }

  // ✅ GET PROPERTY
  @Get(":id")
  getProperty(@Param("id") id: string) {
    return this.propertyService.getProperty(Number(id));
  }

  // ================================
  // ✅ IMAGE UPLOAD TO AWS S3
  // ================================

  @Post("upload-images/:id")
  @UseInterceptors(
    FilesInterceptor("images", 6, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    })
  )
  async uploadImages(
    @Param("id") id: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const imageUrls: string[] = [];

    for (const file of files) {
      const key = `properties/images/${uuid()}-${file.originalname}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      imageUrls.push(url);
    }

    return this.propertyService.saveImages(Number(id), imageUrls);
  }

  // ================================
  // ✅ VIDEO UPLOAD TO AWS S3
  // ================================

  @Post("upload-video/:id")
  @UseInterceptors(
    FileInterceptor("video", {
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
    })
  )
  async uploadVideo(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const key = `properties/videos/${uuid()}-${file.originalname}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME as string,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return this.propertyService.saveVideo(Number(id), videoUrl);
  }
}