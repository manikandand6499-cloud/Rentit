import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  ParseIntPipe,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // 🎤 NEW — Speech to text + AI search
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    return this.aiService.processAudio(file);
  }

  // 🔍 Main multilingual search
  @Post('search')
  @HttpCode(200)
  search(@Body() body: { query: string }) {
    return this.aiService.search(body.query);
  }

  @Get('recommendations')
  recommendations(
    @Query('city') city: string,
    @Query('budget') budget?: string,
    @Query('gender') gender?: string,
  ) {
    return this.aiService.getRecommendations(
      city,
      budget ? parseInt(budget) : undefined,
      gender,
    );
  }

  @Get('trending')
  trending(@Query('city') city?: string) {
    return this.aiService.getTrending(city);
  }

  @Get('similar/:id')
  similar(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.getSimilar(id);
  }

  @Post('view/:id')
  view(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.incrementView(id);
  }

  
}