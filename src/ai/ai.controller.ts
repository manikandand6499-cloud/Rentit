// src/ai/ai.controller.ts

import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  // 🔍 Main multilingual search (USED BY APP)
  @Post('search')
  @HttpCode(200)
  async search(@Body('query') query: string) {
    const result = await this.aiService.processWithGemini(query);

    return {
      success: true,
      ...result,
    };
  }

  // 🌟 Recommended PGs
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

  // 🔥 Trending PGs
  @Get('trending')
  trending(@Query('city') city?: string) {
    return this.aiService.getTrending(city);
  }

  // 🏠 Similar PGs
  @Get('similar/:id')
  similar(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.getSimilar(id);
  }

  // 👁 Track view
  @Post('view/:id')
  view(@Param('id', ParseIntPipe) id: number) {
    return this.aiService.incrementView(id);
  }
}