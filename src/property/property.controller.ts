import { Controller, Post, Put, Body, Param, Get } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreateBasicDto } from './dto/create-basic.dto';
import { CreateDetailsDto } from './dto/create-details.dto';
import { CreateAmenitiesDto } from './dto/create-amenities.dto';
import { CreatePriceDto } from './dto/create-price.dto';

@Controller('property')
export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  @Post('basic')
  createBasic(@Body() dto: CreateBasicDto) {
    return this.propertyService.createBasic(dto);
  }

  @Put('details/:id')
  updateDetails(@Param('id') id: string, @Body() dto: CreateDetailsDto) {
    return this.propertyService.updateDetails(Number(id), dto);
  }

  @Put('amenities/:id')
  updateAmenities(@Param('id') id: string, @Body() dto: CreateAmenitiesDto) {
    return this.propertyService.updateAmenities(Number(id), dto);
  }

  @Put('price/:id')
  updatePrice(@Param('id') id: string, @Body() dto: CreatePriceDto) {
    return this.propertyService.updatePrice(Number(id), dto);
  }

  @Get(':id')
  getProperty(@Param('id') id: string) {
    return this.propertyService.getProperty(Number(id));
  }
  @Put('verify/:id')
verifyProperty(@Param('id') id: string) {
  return this.propertyService.verifyProperty(Number(id));
}
  
}
