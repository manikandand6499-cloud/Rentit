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

import { PropertyService } from './property.service';
import { CreateBasicDto } from './dto/create-basic.dto';
import { CreateDetailsDto } from './dto/create-details.dto';
import { CreateAmenitiesDto } from './dto/create-amenities.dto';
import { CreatePriceDto } from './dto/create-price.dto';
import { CreateContactDto } from './dto/create-contact.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { uploadToS3 } from '../common/s3.upload';
import { UpdateLocationDto } from './dto/location.dto';

@Controller('property')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  userService: any;

  constructor(
    private readonly propertyService: PropertyService,
  ) { }


  /*
==============================
STEP 1 - loactions
==============================
*/

  @UseGuards(JwtAuthGuard)
  @Put("location/:id")
  updatePropertyLocation(
    @Param("id") id: string,
    @Req() req,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.propertyService.updateLocation(
      Number(id),
      req.user.id,
      dto,
    );
  }
  /*
  ==============================
  STEP 1 - BASIC
  ==============================
  */

  @Post('basic')
  createBasic(
    @Req() req,
    @Body() dto: CreateBasicDto,
  ) {

    return this.propertyService.createBasic(
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
  updateDetails(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: CreateDetailsDto,
  ) {

    return this.propertyService.updateDetails(
      Number(id),
      req.user.userId,
      dto,
    );

  }

  /*
  ==============================
  GET ALL PROPERTIES
  ==============================
  */

@Get('getallpropertys')
getAllProperties(
  @Query('lat') lat?: string,
  @Query('lng') lng?: string,
  @Query('city') city?: string,
) {
  return this.propertyService.getAllProperties(
    lat ? parseFloat(lat) : undefined,
    lng ? parseFloat(lng) : undefined,
    city,
  );
}


  @Get('my/list')
  getMyProperties(@Req() req) {

    return this.propertyService.getMyProperties(
      req.user.userId,
    );

  }

  @Get('published/list')
  getPublishedProperties() {

    return this.propertyService.getPublishedProperties();

  }

  /*
  ==============================
  STEP 3 - AMENITIES
  ==============================
  */

  @Put(':id/amenities')
  updateAmenities(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: CreateAmenitiesDto,
  ) {

    return this.propertyService.updateAmenities(
      Number(id),
      req.user.userId,
      dto,
    );

  }

  /*
  ==============================
  STEP 4 - PRICE
  ==============================
  */

  @Put(':id/price')
  updatePrice(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: CreatePriceDto,
  ) {

    return this.propertyService.updatePrice(
      Number(id),
      req.user.userId,
      dto,
    );

  }

  /*
  ==============================
  STEP 5 - UPLOAD IMAGES
  ==============================
  */

  @Post(':id/upload-images')
  @UseInterceptors(FilesInterceptor('files', 6))
  async uploadImages(
    @Param('id') id: string,
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    const urls: string[] = [];

    for (const file of files) {

      const url = await uploadToS3(file);

      urls.push(url);

    }

    return this.propertyService.saveImages(
      Number(id),
      req.user.userId,
      urls,
    );

  }

  /*
  ==============================
  STEP 5 - UPLOAD VIDEO
  ==============================
  */

  @Post(':id/upload-video')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Param('id') id: string,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
  ) {

    const url = await uploadToS3(file);

    return this.propertyService.saveVideo(
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
  verifyProperty(
    @Param('id') id: string,
    @Req() req,
  ) {

    return this.propertyService.verifyProperty(
      Number(id),
      req.user.userId,
    );

  }

  /*
  ==============================
  GET SINGLE PROPERTY
  ==============================
  */

  @Get(':id')
  getProperty(@Param('id') id: string) {

    return this.propertyService.getProperty(
      Number(id),
    );

  }

@Put(':id/delete')
deleteProperty(@Param('id') id: string, @Req() req) {
  return this.propertyService.deleteProperty(
    Number(id),
    req.user.userId,
  );
}

@Put(':id/reactivate')
reactivateProperty(@Param('id') id: string, @Req() req) {
  return this.propertyService.reactivateProperty(
    Number(id),
    req.user.userId,
  );
}

}