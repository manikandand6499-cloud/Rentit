import {
  Controller,
  Post,
  Put,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  UploadedFiles,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';

import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ParseIntPipe } from '@nestjs/common';

import { PropertyService } from './property.service';
import { CreateBasicDto } from './dto/create-basic.dto';
import { CreateDetailsDto } from './dto/create-details.dto';
import { CreateAmenitiesDto } from './dto/create-amenities.dto';
// import { CreatePriceDto } from './dto/create-price.dto';
import { CreateContactDto } from './dto/create-contact.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateLocationDto } from './dto/location.dto';

import { uploadToR2 } from 'src/common/s3.upload';

@Controller('property')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  /*
  ==============================
  STEP 1 - BASIC
  ==============================
  */
  @Post('basic')
  createBasic(@Req() req, @Body() dto: CreateBasicDto) {
    return this.propertyService.createBasic(req.user.userId, dto);
  }

  /*
  ==============================
  STEP 1 - LOCATION
  ==============================
  */

  @Put('location/:id')
  updateLocation(@Param('id') id: string, @Req() req, @Body() dto: UpdateLocationDto) {
    return this.propertyService.updateLocation(
      Number(id),
      req.user.userId,
      dto,
    );
  }

  /*
  ==============================
  STEP 2 - DETAILS
  ==============================
  */
  @Put(':id/details')
  updateDetails(@Param('id') id: string, @Req() req, @Body() dto: CreateDetailsDto) {
    return this.propertyService.updateDetails(
      Number(id),
      req.user.userId,
      dto,
    );
  }

  /*
  ==============================
  STEP 3 - AMENITIES
  ==============================
  */
  @Put(':id/amenities')
  updateAmenities(@Param('id') id: string, @Req() req, @Body() dto: CreateAmenitiesDto) {
    return this.propertyService.updateAmenities(
      Number(id),
      req.user.userId,
      dto,
    );
  }

  /*
  ==============================
  STEP 5 - IMAGES (R2)
  ==============================
  */
  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('existingImages') existingImages: string,
    @Req() req,
  ) {
    const oldImages = existingImages ? JSON.parse(existingImages) : [];
    const newUrls: string[] = [];

    for (const file of files) {
      const url = await uploadToR2(file);
      newUrls.push(url);
    }

    return this.propertyService.saveImages(
      Number(id),
      req.user.userId,
      [...oldImages, ...newUrls],
    );
  }

  /*
  ==============================
  STEP 5 - VIDEO (R2)
  ==============================
  */
@Post(':id/upload-video')
@UseInterceptors(
  FileInterceptor('file', {
    limits: { fileSize: 100 * 1024 * 1024 },
  }),
)
async uploadVideo(
  @Param('id') id: string,
  @Req() req,
  @UploadedFile() file: Express.Multer.File,
) {
  console.log("FILE RECEIVED:", file);

  if (!file) {
    throw new Error("No video file received"); // 🔥 force error
  }

  const url = await uploadToR2(file);

  console.log("VIDEO URL:", url); // 🔥 debug

  if (!url) {
    throw new Error("Upload failed - URL missing");
  }

  return await this.propertyService.saveVideo(
    Number(id),
    req.user.userId,
    url,
  );
}
  /*
  ==============================
  STEP 6 - CONTACT
  ==============================
  */
@Put(':id/contact')
updateContact(
  @Param('id') id: string,
  @Req() req,
  @Body() dto: CreateContactDto,
) {
  return this.propertyService.updateContact(
    Number(id),
    req.user.userId,
    dto,
  );
}

  /*
  ==============================
  STEP 7 - VERIFY
  ==============================
  */
  @Put(':id/verify')
  verifyProperty(@Param('id') id: string, @Req() req) {
    return this.propertyService.verifyProperty(
      Number(id),
      req.user.userId,
    );
  }

  /*
  ==============================
  GET ALL
  ==============================
  */
 @Get('all')
getAllProperties(@Req() req) {
  const userId = req.user.userId;

  return this.propertyService.getAllProperties(userId);
}



  /*
  ==============================
  MY PROPERTIES
  ==============================
  */
  @Get('my')
  getMyProperties(@Req() req) {
    return this.propertyService.getMyProperties(req.user.userId);
  }

  /*
  ==============================
  SINGLE PROPERTY
  ==============================
  */
 

  @Get(':id')
getProperty(@Param('id', ParseIntPipe) id: number) {
  return this.propertyService.getProperty(id);
}

  /*
  ==============================
  DELETE
  ==============================
  */
  @Put(':id/delete')
  deleteProperty(@Param('id') id: string, @Req() req) {
    return this.propertyService.deleteProperty(
      Number(id),
      req.user.userId,
    );
  }
}